-- Migration 003: Inventory Movements Ledger
-- Deploys public.inventory_movements table, automatic logging triggers, and adjust_inventory RPC.

-- ============================================================================
-- TABLE: public.inventory_movements
-- ============================================================================
create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  product_id uuid references public.products(id) on delete set null,
  variant_id uuid references public.product_variants(id) on delete set null,
  order_id uuid references public.orders(id) on delete set null,
  performed_by uuid references public.profiles(id) on delete set null,
  movement_type text not null check (movement_type in ('sale', 'return', 'restock', 'damage', 'correction', 'initial_stock')),
  quantity integer not null check (quantity <> 0),
  stock_before integer not null check (stock_before >= 0),
  stock_after integer not null check (stock_after >= 0),
  reason text,
  note text,
  created_at timestamptz not null default timezone('utc', now()),

  -- Integrity constraints: Mathematical Balance & Semantic Sign Rules
  constraint chk_inventory_movements_balance check (stock_after = stock_before + quantity),
  constraint chk_inventory_movements_semantic_sign check (
    (movement_type = 'sale' and quantity < 0) or
    (movement_type = 'return' and quantity > 0) or
    (movement_type = 'restock' and quantity > 0) or
    (movement_type = 'damage' and quantity < 0) or
    (movement_type = 'initial_stock' and quantity > 0) or
    (movement_type = 'correction')
  )
);

-- ============================================================================
-- INDEXES & RLS
-- ============================================================================
create index if not exists idx_inventory_movements_product_id on public.inventory_movements(product_id);
create index if not exists idx_inventory_movements_variant_id on public.inventory_movements(variant_id);
create index if not exists idx_inventory_movements_order_id on public.inventory_movements(order_id);
create index if not exists idx_inventory_movements_created_at on public.inventory_movements(created_at desc);

alter table public.inventory_movements enable row level security;

create policy "inventory_movements_admin_read"
on public.inventory_movements
for select
using (public.is_admin());

-- No update/delete/insert policies are created on public.inventory_movements
-- to keep it append-only and editable only by database triggers or functions.

-- ============================================================================
-- DATA VALIDATION TRIGGER ON MOVEMENT INSERT
-- ============================================================================
create or replace function public.validate_inventory_movement_item()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.product_id is null and new.variant_id is null then
    raise exception 'Product ID or Variant ID must be provided';
  end if;

  if new.variant_id is not null then
    if not exists (
      select 1 
      from public.product_variants 
      where id = new.variant_id and product_id = new.product_id
    ) then
      raise exception 'Variant does not belong to specified product';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists validate_inventory_movement_before_insert on public.inventory_movements;
create trigger validate_inventory_movement_before_insert
before insert on public.inventory_movements
for each row execute function public.validate_inventory_movement_item();

-- ============================================================================
-- AUTOMATIC INITIAL STOCK TRACKING TRIGGERS
-- ============================================================================
create or replace function public.log_initial_product_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.stock_quantity > 0 then
    insert into public.inventory_movements (
      product_id,
      variant_id,
      movement_type,
      quantity,
      stock_before,
      stock_after,
      reason,
      note
    )
    values (
      new.id,
      null,
      'initial_stock',
      new.stock_quantity,
      0,
      new.stock_quantity,
      'Initial product catalog creation',
      'Automatic initial stock creation'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists log_initial_product_stock_trigger on public.products;
create trigger log_initial_product_stock_trigger
after insert on public.products
for each row execute function public.log_initial_product_stock();

create or replace function public.log_initial_variant_stock()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.stock_quantity > 0 then
    insert into public.inventory_movements (
      product_id,
      variant_id,
      movement_type,
      quantity,
      stock_before,
      stock_after,
      reason,
      note
    )
    values (
      new.product_id,
      new.id,
      'initial_stock',
      new.stock_quantity,
      0,
      new.stock_quantity,
      'Initial product variant creation',
      'Automatic initial stock creation'
    );
  end if;
  return new;
end;
$$;

drop trigger if exists log_initial_variant_stock_trigger on public.product_variants;
create trigger log_initial_variant_stock_trigger
after insert on public.product_variants
for each row execute function public.log_initial_variant_stock();

-- ============================================================================
-- REDECLARE ORDER INVENTORY MUTATION TRIGGERS WITH LEDGER INTEGRATION
-- ============================================================================
create or replace function public.update_inventory_on_order_item_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  product_row public.products%rowtype;
  variant_row public.product_variants%rowtype;
begin
  if new.product_id is null then
    raise exception 'Order item must reference a product';
  end if;

  if new.quantity is null or new.quantity <= 0 then
    raise exception 'Order item quantity must be positive';
  end if;

  select *
  into product_row
  from public.products
  where id = new.product_id
  for update;

  if not found then
    raise exception 'Product does not exist';
  end if;

  if new.variant_id is null then
    if product_row.track_inventory then
      update public.products
      set stock_quantity = stock_quantity - new.quantity,
          updated_at = timezone('utc', now())
      where id = new.product_id
        and track_inventory = true
        and stock_quantity >= new.quantity;

      if not found then
        raise exception 'Insufficient product stock';
      end if;

      insert into public.inventory_movements (
        product_id,
        variant_id,
        order_id,
        movement_type,
        quantity,
        stock_before,
        stock_after,
        reason,
        note
      )
      values (
        new.product_id,
        null,
        new.order_id,
        'sale',
        -new.quantity,
        product_row.stock_quantity,
        product_row.stock_quantity - new.quantity,
        'Customer purchase',
        'Automatic order placement'
      );
    end if;
  else
    select *
    into variant_row
    from public.product_variants
    where id = new.variant_id
      and product_id = new.product_id
    for update;

    if not found then
      raise exception 'Variant does not belong to product';
    end if;

    update public.product_variants
    set stock_quantity = stock_quantity - new.quantity,
        updated_at = timezone('utc', now())
    where id = new.variant_id
      and product_id = new.product_id
      and stock_quantity >= new.quantity;

    if not found then
      raise exception 'Insufficient variant stock';
    end if;

    insert into public.inventory_movements (
      product_id,
      variant_id,
      order_id,
      movement_type,
      quantity,
      stock_before,
      stock_after,
      reason,
      note
    )
    values (
      new.product_id,
      new.variant_id,
      new.order_id,
      'sale',
      -new.quantity,
      variant_row.stock_quantity,
      variant_row.stock_quantity - new.quantity,
      'Customer purchase',
      'Automatic order placement'
    );
  end if;

  update public.products
  set total_sold = total_sold + new.quantity,
      updated_at = timezone('utc', now())
  where id = new.product_id;

  return new;
end;
$$;

create or replace function public.sync_inventory_on_order_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  item record;
  current_stock integer;
  product_rec record;
begin
  if old.status not in ('cancelled', 'refunded') and new.status in ('cancelled', 'refunded') then
    for item in
      select product_id, variant_id, quantity
      from public.order_items
      where order_id = new.id
    loop
      if item.variant_id is not null then
        select stock_quantity
        into current_stock
        from public.product_variants
        where id = item.variant_id
        for update;

        update public.product_variants
        set stock_quantity = stock_quantity + item.quantity,
            updated_at = timezone('utc', now())
        where id = item.variant_id;

        insert into public.inventory_movements (
          product_id,
          variant_id,
          order_id,
          movement_type,
          quantity,
          stock_before,
          stock_after,
          reason,
          note
        )
        values (
          item.product_id,
          item.variant_id,
          new.id,
          'return',
          item.quantity,
          current_stock,
          current_stock + item.quantity,
          'Order status change to ' || new.status,
          'Automatic order inventory restoration'
        );
      elsif item.product_id is not null then
        select stock_quantity, track_inventory
        into product_rec
        from public.products
        where id = item.product_id
        for update;

        if product_rec.track_inventory then
          update public.products
          set stock_quantity = stock_quantity + item.quantity,
              updated_at = timezone('utc', now())
          where id = item.product_id;

          insert into public.inventory_movements (
            product_id,
            variant_id,
            order_id,
            movement_type,
            quantity,
            stock_before,
            stock_after,
            reason,
            note
          )
          values (
            item.product_id,
            null,
            new.id,
            'return',
            item.quantity,
            product_rec.stock_quantity,
            product_rec.stock_quantity + item.quantity,
            'Order status change to ' || new.status,
            'Automatic order inventory restoration'
          );
        end if;
      end if;

      if item.product_id is not null then
        update public.products
        set total_sold = total_sold - item.quantity,
            updated_at = timezone('utc', now())
        where id = item.product_id
          and total_sold >= item.quantity;

        if not found then
          raise exception 'Cannot reverse sold quantity for order item';
        end if;
      end if;
    end loop;
  elsif old.status in ('cancelled', 'refunded') and new.status not in ('cancelled', 'refunded') then
    for item in
      select product_id, variant_id, quantity
      from public.order_items
      where order_id = new.id
    loop
      if item.variant_id is not null then
        select stock_quantity
        into current_stock
        from public.product_variants
        where id = item.variant_id
        for update;

        update public.product_variants
        set stock_quantity = stock_quantity - item.quantity,
            updated_at = timezone('utc', now())
        where id = item.variant_id
          and stock_quantity >= item.quantity;

        if not found then
          raise exception 'Insufficient variant stock to reactivate order';
        end if;

        insert into public.inventory_movements (
          product_id,
          variant_id,
          order_id,
          movement_type,
          quantity,
          stock_before,
          stock_after,
          reason,
          note
        )
        values (
          item.product_id,
          item.variant_id,
          new.id,
          'sale',
          -item.quantity,
          current_stock,
          current_stock - item.quantity,
          'Order status change to ' || new.status || ' (Reactivation)',
          'Automatic order inventory re-deduction'
        );
      elsif item.product_id is not null then
        select stock_quantity, track_inventory
        into product_rec
        from public.products
        where id = item.product_id
        for update;

        if product_rec.track_inventory then
          update public.products
          set stock_quantity = stock_quantity - item.quantity,
              updated_at = timezone('utc', now())
          where id = item.product_id
            and track_inventory = true
            and stock_quantity >= item.quantity;

          if not found then
            raise exception 'Insufficient product stock to reactivate order';
          end if;

          insert into public.inventory_movements (
            product_id,
            variant_id,
            order_id,
            movement_type,
            quantity,
            stock_before,
            stock_after,
            reason,
            note
          )
          values (
            item.product_id,
            null,
            new.id,
            'sale',
            -item.quantity,
            product_rec.stock_quantity,
            product_rec.stock_quantity - item.quantity,
            'Order status change to ' || new.status || ' (Reactivation)',
            'Automatic order inventory re-deduction'
          );
        end if;
      end if;

      if item.product_id is not null then
        update public.products
        set total_sold = total_sold + item.quantity,
            updated_at = timezone('utc', now())
        where id = item.product_id;
      end if;
    end loop;
  end if;

  return new;
end;
$$;

-- ============================================================================
-- SECURE DATABASE RPC FOR MANUAL ADJUSTMENTS
-- ============================================================================
create or replace function public.adjust_inventory(
  p_product_id uuid,
  p_variant_id uuid,
  p_quantity integer,
  p_movement_type text,
  p_reason text,
  p_note text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user_role public.user_role;
  v_current_stock integer;
  v_new_stock integer;
  v_product_exists boolean;
  v_variant_exists boolean;
begin
  -- 1. Authenticate & authorize caller
  if auth.uid() is null then
    raise exception 'Unauthorized';
  end if;

  select role
  into v_user_role
  from public.profiles
  where id = auth.uid();

  if v_user_role is null or v_user_role <> 'admin' then
    raise exception 'Forbidden: Admin authorization required';
  end if;

  -- 2. Validate input variables
  if p_quantity = 0 then
    raise exception 'Adjustment quantity cannot be zero';
  end if;

  if p_movement_type not in ('restock', 'damage', 'correction') then
    raise exception 'Invalid manual adjustment movement type: %', p_movement_type;
  end if;

  -- 3. Run variant vs product level locks
  if p_variant_id is not null then
    select exists (
      select 1 
      from public.product_variants 
      where id = p_variant_id and product_id = p_product_id
    ) into v_variant_exists;

    if not v_variant_exists then
      raise exception 'Variant does not belong to specified product';
    end if;

    select stock_quantity
    into v_current_stock
    from public.product_variants
    where id = p_variant_id
    for update;

    v_new_stock := v_current_stock + p_quantity;

    if v_new_stock < 0 then
      raise exception 'Stock level cannot drop below zero';
    end if;

    update public.product_variants
    set stock_quantity = v_new_stock,
        updated_at = timezone('utc', now())
    where id = p_variant_id;
  else
    select exists (
      select 1 
      from public.products 
      where id = p_product_id
    ) into v_product_exists;

    if not v_product_exists then
      raise exception 'Product does not exist';
    end if;

    select stock_quantity
    into v_current_stock
    from public.products
    where id = p_product_id
    for update;

    v_new_stock := v_current_stock + p_quantity;

    if v_new_stock < 0 then
      raise exception 'Stock level cannot drop below zero';
    end if;

    update public.products
    set stock_quantity = v_new_stock,
        updated_at = timezone('utc', now())
    where id = p_product_id;
  end if;

  -- 4. Insert ledger entry
  insert into public.inventory_movements (
    product_id,
    variant_id,
    performed_by,
    movement_type,
    quantity,
    stock_before,
    stock_after,
    reason,
    note
  )
  values (
    p_product_id,
    p_variant_id,
    auth.uid(),
    p_movement_type,
    p_quantity,
    v_current_stock,
    v_new_stock,
    p_reason,
    p_note
  );

  return jsonb_build_object(
    'success', true,
    'stock_before', v_current_stock,
    'stock_after', v_new_stock
  );
end;
$$;

revoke all on function public.adjust_inventory(uuid, uuid, integer, text, text, text) from public;
grant execute on function public.adjust_inventory(uuid, uuid, integer, text, text, text) to authenticated;
