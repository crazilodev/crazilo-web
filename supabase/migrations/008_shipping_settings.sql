-- Migration 008: Dynamic Shipping Fee & Threshold in Site Settings
-- Adds shipping_fee column to site_settings and makes create_order_with_items use dynamic shipping charge and threshold.

alter table public.site_settings
  add column if not exists shipping_fee numeric(10,2) not null default 50;

create or replace function public.create_order_with_items(
  p_shipping_address jsonb,
  p_billing_address jsonb,
  p_coupon_code citext,
  p_payment_method text,
  p_customer_notes text,
  p_items jsonb
)
returns public.orders
language plpgsql
security definer
set search_path = public
as $$
declare
  order_row public.orders%rowtype;
  coupon_row public.coupons%rowtype;
  subtotal numeric(12,2) := 0;
  shipping_threshold numeric(12,2) := 599;
  default_shipping_fee numeric(12,2) := 50;
  shipping_amount numeric(12,2) := 0;
  discount_amount numeric(12,2) := 0;
  total_amount numeric(12,2) := 0;
  normalized_coupon_code citext;
begin
  -- For authenticated users, verify account is not suspended
  if auth.uid() is not null then
    if not public.is_active_user() then
      raise exception 'Account suspended. Order placement is not permitted.';
    end if;
  end if;

  if p_shipping_address is null then
    raise exception 'Shipping address is required';
  end if;

  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'No items in order';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_items) as item(
      product_id uuid,
      variant_id uuid,
      quantity integer
    )
    where product_id is null
      or quantity is null
      or quantity <= 0
  ) then
    raise exception 'Invalid order items';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_items) as item(
      product_id uuid,
      variant_id uuid,
      quantity integer
    )
    left join public.products p on p.id = item.product_id
    where p.id is null
  ) then
    raise exception 'Product does not exist';
  end if;

  if exists (
    select 1
    from jsonb_to_recordset(p_items) as item(
      product_id uuid,
      variant_id uuid,
      quantity integer
    )
    join public.products p on p.id = item.product_id
    left join public.product_variants v on v.id = item.variant_id and v.product_id = p.id
    where item.variant_id is not null
      and v.id is null
  ) then
    raise exception 'Variant does not belong to product';
  end if;

  perform 1
  from public.products p
  where p.id in (
    select distinct item.product_id
    from jsonb_to_recordset(p_items) as item(
      product_id uuid,
      variant_id uuid,
      quantity integer
    )
  )
  for update;

  perform 1
  from public.product_variants v
  where v.id in (
    select distinct item.variant_id
    from jsonb_to_recordset(p_items) as item(
      product_id uuid,
      variant_id uuid,
      quantity integer
    )
    where item.variant_id is not null
  )
  for update;

  with validated_items as (
    select
      item.product_id,
      item.variant_id,
      item.quantity,
      p.name as product_name,
      v.name as variant_name,
      coalesce(v.sku, p.sku) as sku,
      p.thumbnail_url,
      case
        when item.variant_id is null then p.price
        else v.price
      end as unit_price,
      case
        when item.variant_id is null then p.price * item.quantity
        else v.price * item.quantity
      end as total_price
    from jsonb_to_recordset(p_items) as item(
      product_id uuid,
      variant_id uuid,
      quantity integer
    )
    join public.products p on p.id = item.product_id
    left join public.product_variants v on v.id = item.variant_id and v.product_id = p.id
  )
  select coalesce(sum(total_price), 0)
  into subtotal
  from validated_items;

  -- Read both free shipping threshold and standard shipping fee dynamically from site_settings
  select
    coalesce((select free_shipping_threshold from public.site_settings where scope = 'global'), 599),
    coalesce((select shipping_fee from public.site_settings where scope = 'global'), 50)
  into shipping_threshold, default_shipping_fee;

  shipping_amount := case when subtotal >= shipping_threshold then 0 else default_shipping_fee end;

  normalized_coupon_code := nullif(upper(trim(coalesce(p_coupon_code::text, ''))), '');

  if normalized_coupon_code is not null then
    select *
    into coupon_row
    from public.coupons
    where code = normalized_coupon_code
      and is_active = true
    for update;

    if found then
      if (coupon_row.expires_at is null or coupon_row.expires_at > timezone('utc', now()))
        and subtotal >= coupon_row.minimum_order_amount
        and (coupon_row.usage_limit is null or coupon_row.used_count < coupon_row.usage_limit)
      then
        if coupon_row.discount_type = 'percentage' then
          discount_amount := round((subtotal * coupon_row.discount_value) / 100, 2);
          if coupon_row.maximum_discount is not null then
            discount_amount := least(discount_amount, coupon_row.maximum_discount);
          end if;
        else
          discount_amount := coupon_row.discount_value;
        end if;

        update public.coupons
        set used_count = used_count + 1
        where id = coupon_row.id;
      end if;
    end if;
  end if;

  total_amount := greatest(0, subtotal + shipping_amount - discount_amount);

  insert into public.orders (
    user_id,
    shipping_address,
    billing_address,
    subtotal,
    discount_amount,
    shipping_amount,
    tax_amount,
    total_amount,
    coupon_code,
    coupon_id,
    payment_method,
    customer_notes,
    status,
    payment_status
  )
  values (
    auth.uid(),
    p_shipping_address,
    coalesce(p_billing_address, p_shipping_address),
    subtotal,
    discount_amount,
    shipping_amount,
    0,
    total_amount,
    case when coupon_row.id is not null and discount_amount > 0 then normalized_coupon_code else null end,
    case when coupon_row.id is not null and discount_amount > 0 then coupon_row.id else null end,
    coalesce(nullif(p_payment_method, ''), 'cod'),
    p_customer_notes,
    'pending',
    'pending'
  )
  returning * into order_row;

  insert into public.order_items (
    order_id,
    product_id,
    variant_id,
    product_name,
    variant_name,
    sku,
    thumbnail_url,
    quantity,
    unit_price,
    total_price
  )
  select
    order_row.id,
    item.product_id,
    item.variant_id,
    p.name,
    v.name,
    coalesce(v.sku, p.sku),
    p.thumbnail_url,
    item.quantity,
    case
      when item.variant_id is null then p.price
      else v.price
    end,
    case
      when item.variant_id is null then p.price * item.quantity
      else v.price * item.quantity
    end
  from jsonb_to_recordset(p_items) as item(
    product_id uuid,
    variant_id uuid,
    quantity integer
  )
  join public.products p on p.id = item.product_id
  left join public.product_variants v on v.id = item.variant_id and v.product_id = p.id;

  return order_row;
end;
$$;

revoke all on function public.create_order_with_items(jsonb, jsonb, citext, text, text, jsonb) from public;
grant execute on function public.create_order_with_items(jsonb, jsonb, citext, text, text, jsonb) to authenticated, anon, service_role;

