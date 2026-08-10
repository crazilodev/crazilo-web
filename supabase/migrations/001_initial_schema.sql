-- Crazilo initial schema
-- Fresh Supabase/PostgreSQL migration for the current storefront and admin app

-- ============================================================================
-- EXTENSIONS
-- ============================================================================
create extension if not exists "pgcrypto";
create extension if not exists "pg_trgm";
create extension if not exists "citext";

-- ============================================================================
-- ENUMS
-- ============================================================================
do $$
begin
  create type public.user_role as enum ('customer', 'admin');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.product_unit as enum ('g', 'kg', 'ml', 'l', 'pcs', 'pack');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.coupon_discount_type as enum ('percentage', 'fixed');
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.order_status as enum (
    'pending',
    'confirmed',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
    'refunded'
  );
exception
  when duplicate_object then null;
end $$;

do $$
begin
  create type public.payment_status as enum ('pending', 'paid', 'failed', 'refunded');
exception
  when duplicate_object then null;
end $$;

-- ============================================================================
-- TABLES
-- ============================================================================
create table if not exists public.site_settings (
  scope text primary key default 'global' check (scope = 'global'),
  store_name text not null default 'Crazilo',
  support_phone text,
  support_email citext,
  support_address text,
  support_hours text,
  footer_description text,
  free_shipping_threshold numeric(10,2) not null default 599,
  currency_code char(3) not null default 'INR',
  instagram_url text,
  facebook_url text,
  twitter_url text,
  youtube_url text,
  privacy_policy_url text,
  terms_url text,
  returns_policy_url text,
  store_locator_url text,
  faqs_url text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email citext not null unique,
  full_name text,
  phone text,
  avatar_url text,
  role public.user_role not null default 'customer',
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  icon_url text,
  parent_id uuid references public.categories (id) on delete restrict,
  sort_order integer not null default 0 check (sort_order >= 0),
  is_active boolean not null default true,
  meta_title text,
  meta_description text,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  short_description text,
  category_id uuid references public.categories (id) on delete restrict,
  price numeric(12,2) not null check (price > 0),
  compare_price numeric(12,2) check (compare_price is null or compare_price >= 0),
  cost_price numeric(12,2) check (cost_price is null or cost_price >= 0),
  sku text unique,
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  low_stock_threshold integer not null default 10 check (low_stock_threshold >= 0),
  track_inventory boolean not null default true,
  weight_grams integer check (weight_grams is null or weight_grams >= 0),
  unit public.product_unit not null default 'g',
  images text[] not null default '{}'::text[],
  thumbnail_url text,
  is_active boolean not null default true,
  is_featured boolean not null default false,
  is_bestseller boolean not null default false,
  is_new boolean not null default false,
  is_organic boolean not null default false,
  no_added_sugar boolean not null default false,
  meta_title text,
  meta_description text,
  tags text[] not null default '{}'::text[],
  nutritional_info jsonb not null default '{}'::jsonb,
  average_rating numeric(3,2) not null default 0 check (average_rating between 0 and 5),
  review_count integer not null default 0 check (review_count >= 0),
  total_sold integer not null default 0 check (total_sold >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  name text not null,
  sku text unique,
  price numeric(12,2) not null check (price > 0),
  compare_price numeric(12,2) check (compare_price is null or compare_price >= 0),
  stock_quantity integer not null default 0 check (stock_quantity >= 0),
  weight_grams integer check (weight_grams is null or weight_grams >= 0),
  display_order integer not null default 0 check (display_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (product_id, name)
);

create table if not exists public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  subtitle text,
  badge_text text,
  image_url text not null,
  mobile_image_url text,
  cta_text text not null default 'Shop Now',
  cta_link text not null default '/products',
  display_order integer not null default 0 check (display_order >= 0),
  is_active boolean not null default true,
  bg_color text not null default '#8B0000',
  text_color text not null default '#FFFFFF',
  starts_at timestamptz,
  ends_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.announcements (
  id uuid primary key default gen_random_uuid(),
  text text not null,
  link text,
  display_order integer not null default 0 check (display_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.testimonials (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  location text not null,
  rating integer not null check (rating between 1 and 5),
  text text not null,
  product_name text not null,
  avatar_initial char(1) not null,
  avatar_url text,
  display_order integer not null default 0 check (display_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.home_feature_cards (
  id uuid primary key default gen_random_uuid(),
  section_key text not null check (section_key in ('find_your_snack', 'featured_collections')),
  eyebrow_text text,
  title text not null,
  subtitle text not null,
  description text,
  image_url text not null,
  category_id uuid references public.categories (id) on delete set null,
  link_url text,
  display_order integer not null default 0 check (display_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.home_highlights (
  id uuid primary key default gen_random_uuid(),
  icon_key text not null,
  title text not null,
  description text not null,
  display_order integer not null default 0 check (display_order >= 0),
  is_active boolean not null default true,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.coupons (
  id uuid primary key default gen_random_uuid(),
  code citext not null unique,
  description text,
  discount_type public.coupon_discount_type not null,
  discount_value numeric(10,2) not null check (discount_value > 0),
  minimum_order_amount numeric(10,2) not null default 0 check (minimum_order_amount >= 0),
  maximum_discount numeric(10,2) check (maximum_discount is null or maximum_discount >= 0),
  usage_limit integer check (usage_limit is null or usage_limit > 0),
  used_count integer not null default 0 check (used_count >= 0),
  is_active boolean not null default true,
  starts_at timestamptz not null default timezone('utc', now()),
  expires_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.addresses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  full_name text not null,
  phone text not null,
  address_line1 text not null,
  address_line2 text,
  city text not null,
  state text not null,
  pincode text not null check (pincode ~ '^[0-9]{6}$'),
  country text not null default 'India',
  is_default boolean not null default false,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references public.profiles (id) on delete set null,
  shipping_address jsonb not null,
  billing_address jsonb,
  subtotal numeric(12,2) not null check (subtotal >= 0),
  discount_amount numeric(12,2) not null default 0 check (discount_amount >= 0),
  shipping_amount numeric(12,2) not null default 0 check (shipping_amount >= 0),
  tax_amount numeric(12,2) not null default 0 check (tax_amount >= 0),
  total_amount numeric(12,2) not null check (total_amount >= 0),
  coupon_code citext,
  coupon_id uuid references public.coupons (id) on delete set null,
  status public.order_status not null default 'pending',
  payment_status public.payment_status not null default 'pending',
  payment_method text not null default 'cod' check (payment_method in ('cod', 'online')),
  payment_id text,
  tracking_number text,
  tracking_url text,
  customer_notes text,
  admin_notes text,
  confirmed_at timestamptz,
  shipped_at timestamptz,
  delivered_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  product_id uuid not null references public.products (id) on delete restrict,
  variant_id uuid references public.product_variants (id) on delete restrict,
  product_name text not null,
  variant_name text,
  sku text,
  thumbnail_url text,
  quantity integer not null check (quantity > 0),
  unit_price numeric(12,2) not null check (unit_price >= 0),
  total_price numeric(12,2) not null check (total_price >= 0),
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  order_id uuid references public.orders (id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  title text,
  body text,
  images text[] not null default '{}'::text[],
  is_verified_purchase boolean not null default false,
  is_approved boolean not null default false,
  helpful_count integer not null default 0 check (helpful_count >= 0),
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now()),
  unique (product_id, user_id)
);

create table if not exists public.wishlists (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  created_at timestamptz not null default timezone('utc', now()),
  unique (user_id, product_id)
);

create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  is_active boolean not null default true,
  subscribed_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

-- ============================================================================
-- FUNCTIONS
-- ============================================================================
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc', now());
  return new;
end;
$$;

create or replace function public.validate_category_hierarchy()
returns trigger
language plpgsql
as $$
declare
  parent_row public.categories%rowtype;
begin
  if new.parent_id is not null then
    if new.parent_id = new.id then
      raise exception 'A category cannot reference itself as a parent';
    end if;

    select *
    into parent_row
    from public.categories
    where id = new.parent_id;

    if not found then
      raise exception 'Parent category does not exist';
    end if;

    if parent_row.parent_id is not null then
      raise exception 'Only two category levels are allowed';
    end if;

    if exists (
      select 1
      from public.categories child
      where child.parent_id = new.id
    ) then
      raise exception 'A category with children cannot become a subcategory';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles p
    where p.id = auth.uid()
      and p.role = 'admin'
  );
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    email,
    full_name,
    phone,
    avatar_url,
    role,
    is_active
  )
  values (
    new.id,
    new.email,
    nullif(new.raw_user_meta_data ->> 'full_name', ''),
    nullif(new.raw_user_meta_data ->> 'phone', ''),
    nullif(new.raw_user_meta_data ->> 'avatar_url', ''),
    'customer',
    true
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = excluded.full_name,
        phone = excluded.phone,
        avatar_url = excluded.avatar_url;

  return new;
end;
$$;

create or replace function public.protect_profile_updates()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_admin() and auth.uid() = old.id then
    new.id := old.id;
    new.email := old.email;
    new.role := old.role;
    new.is_active := old.is_active;
    new.created_at := old.created_at;
  end if;

  new.updated_at := timezone('utc', now());
  return new;
end;
$$;

create sequence if not exists public.order_number_seq start with 100000 increment by 1;

create or replace function public.generate_order_number()
returns trigger
language plpgsql
as $$
begin
  if new.order_number is null or new.order_number = '' then
    new.order_number :=
      'CRZ-' ||
      to_char(timezone('utc', now()), 'YYYYMMDD') ||
      '-' ||
      lpad(nextval('public.order_number_seq')::text, 6, '0');
  end if;

  return new;
end;
$$;

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
  shipping_amount numeric(12,2) := 0;
  discount_amount numeric(12,2) := 0;
  total_amount numeric(12,2) := 0;
  normalized_coupon_code citext;
begin
  if auth.uid() is null then
    raise exception 'Unauthorized';
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

  select coalesce((select free_shipping_threshold from public.site_settings where scope = 'global'), 599)
  into shipping_threshold;

  shipping_amount := case when subtotal >= shipping_threshold then 0 else 50 end;

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
    validated_items.product_id,
    validated_items.variant_id,
    validated_items.product_name,
    validated_items.variant_name,
    validated_items.sku,
    validated_items.thumbnail_url,
    validated_items.quantity,
    validated_items.unit_price,
    validated_items.total_price
  from (
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
  ) as validated_items;

  return order_row;
end;
$$;

revoke all on function public.create_order_with_items(jsonb, jsonb, citext, text, text, jsonb) from public;
grant execute on function public.create_order_with_items(jsonb, jsonb, citext, text, text, jsonb) to authenticated;

create or replace function public.sync_profile_email_from_auth_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.email is distinct from old.email then
    update public.profiles
    set email = new.email,
        updated_at = timezone('utc', now())
    where id = new.id;
  end if;

  return new;
end;
$$;

create or replace function public.update_product_review_stats()
returns trigger
language plpgsql
as $$
declare
  target_product_id uuid;
begin
  target_product_id := coalesce(new.product_id, old.product_id);

  update public.products
  set
    average_rating = coalesce((
      select round(avg(r.rating)::numeric, 2)
      from public.reviews r
      where r.product_id = target_product_id
        and r.is_approved = true
    ), 0),
    review_count = coalesce((
      select count(*)
      from public.reviews r
      where r.product_id = target_product_id
        and r.is_approved = true
    ), 0),
    updated_at = timezone('utc', now())
  where id = target_product_id;

  return coalesce(new, old);
end;
$$;

create or replace function public.update_inventory_on_order_item_insert()
returns trigger
language plpgsql
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
as $$
declare
  item record;
begin
  if old.status not in ('cancelled', 'refunded') and new.status in ('cancelled', 'refunded') then
    for item in
      select product_id, variant_id, quantity
      from public.order_items
      where order_id = new.id
    loop
      if item.variant_id is not null then
        update public.product_variants
        set stock_quantity = stock_quantity + item.quantity,
            updated_at = timezone('utc', now())
        where id = item.variant_id;
      elsif item.product_id is not null then
        update public.products
        set stock_quantity = stock_quantity + item.quantity,
            updated_at = timezone('utc', now())
        where id = item.product_id
          and track_inventory = true;
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
        update public.product_variants
        set stock_quantity = stock_quantity - item.quantity,
            updated_at = timezone('utc', now())
        where id = item.variant_id
          and stock_quantity >= item.quantity;

        if not found then
          raise exception 'Insufficient variant stock to reactivate order';
        end if;
      elsif item.product_id is not null then
        update public.products
        set stock_quantity = stock_quantity - item.quantity,
            updated_at = timezone('utc', now())
        where id = item.product_id
          and track_inventory = true
          and stock_quantity >= item.quantity;

        if not found and exists (
          select 1
          from public.products p
          where p.id = item.product_id
            and p.track_inventory = true
        ) then
          raise exception 'Insufficient product stock to reactivate order';
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

create or replace function public.protect_profile_defaults()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.role is null then
    new.role := 'customer';
  end if;
  if new.is_active is null then
    new.is_active := true;
  end if;
  return new;
end;
$$;

-- ============================================================================
-- TRIGGERS
-- ============================================================================
create trigger touch_site_settings_updated_at
before update on public.site_settings
for each row execute function public.touch_updated_at();

create trigger touch_profiles_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();

create trigger protect_profiles_before_update
before update on public.profiles
for each row execute function public.protect_profile_updates();

create trigger defaults_profiles_before_insert
before insert on public.profiles
for each row execute function public.protect_profile_defaults();

create trigger touch_categories_updated_at
before update on public.categories
for each row execute function public.touch_updated_at();

create trigger validate_category_hierarchy_before_write
before insert or update on public.categories
for each row execute function public.validate_category_hierarchy();

create trigger touch_products_updated_at
before update on public.products
for each row execute function public.touch_updated_at();

create trigger touch_product_variants_updated_at
before update on public.product_variants
for each row execute function public.touch_updated_at();

create trigger touch_banners_updated_at
before update on public.banners
for each row execute function public.touch_updated_at();

create trigger touch_announcements_updated_at
before update on public.announcements
for each row execute function public.touch_updated_at();

create trigger touch_testimonials_updated_at
before update on public.testimonials
for each row execute function public.touch_updated_at();

create trigger touch_home_feature_cards_updated_at
before update on public.home_feature_cards
for each row execute function public.touch_updated_at();

create trigger touch_home_highlights_updated_at
before update on public.home_highlights
for each row execute function public.touch_updated_at();

create trigger touch_coupons_updated_at
before update on public.coupons
for each row execute function public.touch_updated_at();

create trigger touch_addresses_updated_at
before update on public.addresses
for each row execute function public.touch_updated_at();

create trigger touch_orders_updated_at
before update on public.orders
for each row execute function public.touch_updated_at();

create trigger touch_reviews_updated_at
before update on public.reviews
for each row execute function public.touch_updated_at();

create trigger touch_newsletter_subscribers_updated_at
before update on public.newsletter_subscribers
for each row execute function public.touch_updated_at();

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create trigger sync_profile_email_after_auth_update
after update of email on auth.users
for each row execute function public.sync_profile_email_from_auth_user();

create trigger set_order_number_before_insert
before insert on public.orders
for each row execute function public.generate_order_number();

create trigger sync_inventory_after_order_status_change
after update of status on public.orders
for each row execute function public.sync_inventory_on_order_status_change();

create trigger update_review_stats_after_change
after insert or update or delete on public.reviews
for each row execute function public.update_product_review_stats();

create trigger update_inventory_after_order_item_insert
after insert on public.order_items
for each row execute function public.update_inventory_on_order_item_insert();

-- ============================================================================
-- INDEXES
-- ============================================================================
create index if not exists idx_site_settings_updated_at on public.site_settings (updated_at);
create index if not exists idx_profiles_role on public.profiles (role);
create index if not exists idx_profiles_is_active on public.profiles (is_active);
create index if not exists idx_categories_parent_id on public.categories (parent_id);
create index if not exists idx_categories_sort_order on public.categories (sort_order);
create index if not exists idx_categories_is_active on public.categories (is_active);
create index if not exists idx_products_category_id on public.products (category_id);
create index if not exists idx_products_is_active on public.products (is_active);
create index if not exists idx_products_is_featured on public.products (is_featured);
create index if not exists idx_products_is_bestseller on public.products (is_bestseller);
create index if not exists idx_products_is_new on public.products (is_new);
create index if not exists idx_products_is_organic on public.products (is_organic);
create index if not exists idx_products_tags on public.products using gin (tags);
create index if not exists idx_products_name_trgm on public.products using gin (name gin_trgm_ops);
create index if not exists idx_products_slug_trgm on public.products using gin (slug gin_trgm_ops);
create index if not exists idx_products_total_sold on public.products (total_sold desc);
create index if not exists idx_product_variants_product_id on public.product_variants (product_id);
create index if not exists idx_product_variants_is_active on public.product_variants (is_active);
create index if not exists idx_banners_display_order on public.banners (display_order);
create index if not exists idx_banners_is_active on public.banners (is_active);
create index if not exists idx_announcements_display_order on public.announcements (display_order);
create index if not exists idx_announcements_is_active on public.announcements (is_active);
create index if not exists idx_testimonials_display_order on public.testimonials (display_order);
create index if not exists idx_testimonials_is_active on public.testimonials (is_active);
create index if not exists idx_home_feature_cards_section_key on public.home_feature_cards (section_key);
create index if not exists idx_home_feature_cards_display_order on public.home_feature_cards (display_order);
create index if not exists idx_home_feature_cards_is_active on public.home_feature_cards (is_active);
create index if not exists idx_home_highlights_display_order on public.home_highlights (display_order);
create index if not exists idx_home_highlights_is_active on public.home_highlights (is_active);
create index if not exists idx_coupons_code on public.coupons (code);
create index if not exists idx_coupons_is_active on public.coupons (is_active);
create index if not exists idx_coupons_expires_at on public.coupons (expires_at);
create index if not exists idx_addresses_user_id on public.addresses (user_id);
create unique index if not exists idx_addresses_single_default on public.addresses (user_id) where is_default = true;
create index if not exists idx_orders_user_id on public.orders (user_id);
create index if not exists idx_orders_status on public.orders (status);
create index if not exists idx_orders_payment_status on public.orders (payment_status);
create index if not exists idx_orders_created_at on public.orders (created_at desc);
create index if not exists idx_order_items_order_id on public.order_items (order_id);
create index if not exists idx_order_items_product_id on public.order_items (product_id);
create index if not exists idx_order_items_variant_id on public.order_items (variant_id);
create index if not exists idx_reviews_product_id on public.reviews (product_id);
create index if not exists idx_reviews_user_id on public.reviews (user_id);
create index if not exists idx_reviews_is_approved on public.reviews (is_approved);
create index if not exists idx_wishlists_user_id on public.wishlists (user_id);
create index if not exists idx_wishlists_product_id on public.wishlists (product_id);
create index if not exists idx_newsletter_subscribers_is_active on public.newsletter_subscribers (is_active);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================
alter table public.site_settings enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.banners enable row level security;
alter table public.announcements enable row level security;
alter table public.testimonials enable row level security;
alter table public.home_feature_cards enable row level security;
alter table public.home_highlights enable row level security;
alter table public.coupons enable row level security;
alter table public.addresses enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlists enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- ============================================================================
-- POLICIES
-- ============================================================================
create policy "site_settings_public_read"
on public.site_settings
for select
using (true);

create policy "site_settings_admin_write"
on public.site_settings
for all
using (public.is_admin())
with check (public.is_admin());

create policy "profiles_self_or_admin_read"
on public.profiles
for select
using (auth.uid() = id or public.is_admin());

create policy "profiles_self_or_admin_update"
on public.profiles
for update
using (auth.uid() = id or public.is_admin())
with check (auth.uid() = id or public.is_admin());

create policy "categories_public_read"
on public.categories
for select
using (is_active = true or public.is_admin());

create policy "categories_admin_write"
on public.categories
for all
using (public.is_admin())
with check (public.is_admin());

create policy "products_public_read"
on public.products
for select
using (is_active = true or public.is_admin());

create policy "products_admin_write"
on public.products
for all
using (public.is_admin())
with check (public.is_admin());

create policy "product_variants_public_read"
on public.product_variants
for select
using (
  public.is_admin()
  or (
    is_active = true
    and exists (
      select 1
      from public.products p
      where p.id = product_id
        and p.is_active = true
    )
  )
);

create policy "product_variants_admin_write"
on public.product_variants
for all
using (public.is_admin())
with check (public.is_admin());

create policy "banners_public_read"
on public.banners
for select
using (is_active = true or public.is_admin());

create policy "banners_admin_write"
on public.banners
for all
using (public.is_admin())
with check (public.is_admin());

create policy "announcements_public_read"
on public.announcements
for select
using (is_active = true or public.is_admin());

create policy "announcements_admin_write"
on public.announcements
for all
using (public.is_admin())
with check (public.is_admin());

create policy "testimonials_public_read"
on public.testimonials
for select
using (is_active = true or public.is_admin());

create policy "testimonials_admin_write"
on public.testimonials
for all
using (public.is_admin())
with check (public.is_admin());

create policy "home_feature_cards_public_read"
on public.home_feature_cards
for select
using (is_active = true or public.is_admin());

create policy "home_feature_cards_admin_write"
on public.home_feature_cards
for all
using (public.is_admin())
with check (public.is_admin());

create policy "home_highlights_public_read"
on public.home_highlights
for select
using (is_active = true or public.is_admin());

create policy "home_highlights_admin_write"
on public.home_highlights
for all
using (public.is_admin())
with check (public.is_admin());

create policy "coupons_authenticated_read"
on public.coupons
for select
using (auth.role() = 'authenticated' and (is_active = true or public.is_admin()));

create policy "coupons_admin_write"
on public.coupons
for all
using (public.is_admin())
with check (public.is_admin());

create policy "addresses_owner_or_admin_read"
on public.addresses
for select
using (user_id = auth.uid() or public.is_admin());

create policy "addresses_owner_or_admin_write"
on public.addresses
for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "orders_owner_or_admin_read"
on public.orders
for select
using (user_id = auth.uid() or public.is_admin());

create policy "orders_admin_write"
on public.orders
for update
using (public.is_admin())
with check (public.is_admin());

create policy "order_items_owner_or_admin_read"
on public.order_items
for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders o
    where o.id = order_id
      and o.user_id = auth.uid()
  )
);

create policy "reviews_public_read"
on public.reviews
for select
using (is_approved = true or public.is_admin());

create policy "reviews_owner_insert"
on public.reviews
for insert
with check (user_id = auth.uid());

create policy "reviews_owner_or_admin_update"
on public.reviews
for update
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "reviews_owner_or_admin_delete"
on public.reviews
for delete
using (user_id = auth.uid() or public.is_admin());

create policy "wishlists_owner_or_admin_read"
on public.wishlists
for select
using (user_id = auth.uid() or public.is_admin());

create policy "wishlists_owner_or_admin_write"
on public.wishlists
for all
using (user_id = auth.uid() or public.is_admin())
with check (user_id = auth.uid() or public.is_admin());

create policy "newsletter_public_write"
on public.newsletter_subscribers
for insert
with check (true);

create policy "newsletter_admin_update"
on public.newsletter_subscribers
for update
using (public.is_admin())
with check (public.is_admin());

create policy "newsletter_admin_read"
on public.newsletter_subscribers
for select
using (public.is_admin());

create policy "newsletter_admin_delete"
on public.newsletter_subscribers
for delete
using (public.is_admin());

-- ============================================================================
-- STORAGE
-- ============================================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('product-images', 'product-images', true, 10485760, array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]),
  ('category-images', 'category-images', true, 5242880, array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]),
  ('banner-images', 'banner-images', true, 15728640, array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[]),
  ('avatars', 'avatars', true, 2097152, array['image/jpeg', 'image/jpg', 'image/png', 'image/webp']::text[])
on conflict (id) do nothing;

create policy "public_read_product_images"
on storage.objects
for select
using (bucket_id = 'product-images');

create policy "admin_write_product_images"
on storage.objects
for insert
with check (bucket_id = 'product-images' and public.is_admin());

create policy "admin_update_product_images"
on storage.objects
for update
using (bucket_id = 'product-images' and public.is_admin())
with check (bucket_id = 'product-images' and public.is_admin());

create policy "admin_delete_product_images"
on storage.objects
for delete
using (bucket_id = 'product-images' and public.is_admin());

create policy "public_read_category_images"
on storage.objects
for select
using (bucket_id = 'category-images');

create policy "admin_write_category_images"
on storage.objects
for insert
with check (bucket_id = 'category-images' and public.is_admin());

create policy "admin_update_category_images"
on storage.objects
for update
using (bucket_id = 'category-images' and public.is_admin())
with check (bucket_id = 'category-images' and public.is_admin());

create policy "admin_delete_category_images"
on storage.objects
for delete
using (bucket_id = 'category-images' and public.is_admin());

create policy "public_read_banner_images"
on storage.objects
for select
using (bucket_id = 'banner-images');

create policy "admin_write_banner_images"
on storage.objects
for insert
with check (bucket_id = 'banner-images' and public.is_admin());

create policy "admin_update_banner_images"
on storage.objects
for update
using (bucket_id = 'banner-images' and public.is_admin())
with check (bucket_id = 'banner-images' and public.is_admin());

create policy "admin_delete_banner_images"
on storage.objects
for delete
using (bucket_id = 'banner-images' and public.is_admin());

create policy "public_read_avatar_images"
on storage.objects
for select
using (bucket_id = 'avatars');

create policy "owner_or_admin_write_avatar_images"
on storage.objects
for insert
with check (
  bucket_id = 'avatars'
  and (
    public.is_admin()
    or split_part(name, '/', 1) = coalesce(auth.uid()::text, '')
  )
);

create policy "owner_or_admin_update_avatar_images"
on storage.objects
for update
using (
  bucket_id = 'avatars'
  and (
    public.is_admin()
    or split_part(name, '/', 1) = coalesce(auth.uid()::text, '')
  )
)
with check (
  bucket_id = 'avatars'
  and (
    public.is_admin()
    or split_part(name, '/', 1) = coalesce(auth.uid()::text, '')
  )
);

create policy "owner_or_admin_delete_avatar_images"
on storage.objects
for delete
using (
  bucket_id = 'avatars'
  and (
    public.is_admin()
    or split_part(name, '/', 1) = coalesce(auth.uid()::text, '')
  )
);
