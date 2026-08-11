-- Migration: 004_customer_security_hardening
-- Purpose: Hardens customer profiles RLS update policies to prevent role
--          escalation and self-deactivation. Also enforces active-account
--          boundary on the create_order_with_items RPC.

-- ============================================================
-- PART 1A: get_profile_is_active HELPER
-- ============================================================

-- SECURITY DEFINER helper that reads the currently stored is_active value
-- for a given profile ID, bypassing RLS to avoid recursive evaluation.
-- Used by the profiles UPDATE policy to compare the proposed is_active
-- against the existing stored value, closing the self-reactivation gap.
--
-- Marked STABLE because it does not modify the database and returns the
-- same result within a single statement for the same arguments.
-- EXECUTE is restricted: revoked from public, granted only to authenticated.
create or replace function public.get_profile_is_active(profile_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select is_active
  from public.profiles
  where id = profile_id;
$$;

-- Restrict EXECUTE: only authenticated users may call this helper.
-- The anon role never passes the UPDATE policy USING clause on profiles,
-- so it does not need this permission.
revoke all on function public.get_profile_is_active(uuid) from public;
grant execute on function public.get_profile_is_active(uuid) to authenticated;

-- ============================================================
-- PART 1B: PROFILES RLS HARDENING
-- ============================================================

-- Drop the existing permissive update policy on profiles.
drop policy if exists "profiles_self_or_admin_update" on public.profiles;

-- Create the corrected role-hardened update policy.
--
-- USING clause: which rows may be targeted.
--   Unchanged — users can target their own row, admins can target any row.
--
-- WITH CHECK clause: what the proposed row values must satisfy.
--
--   ADMIN path (public.is_admin() = true):
--     Unrestricted. Admins may modify role, is_active, and any other field.
--     Admin self-demotion / self-deactivation is blocked at the server-action
--     layer (requireAdmin / updateCustomerProfileAction), NOT by this policy.
--
--   NON-ADMIN path:
--     1. auth.uid() = id      — must be updating own row only.
--     2. role = 'customer'    — proposed role in new row must stay 'customer'.
--                               Prevents promotion to 'admin'.
--     3. is_active = public.get_profile_is_active(id)
--                             — proposed is_active must equal the CURRENTLY
--                               STORED is_active value. The helper is
--                               SECURITY DEFINER, reads the live DB value,
--                               and does not trigger RLS recursion.
--
--                               Consequence:
--                               - Active customer (stored=true):  proposed
--                                 must be true → cannot set false.
--                               - Inactive customer (stored=false): proposed
--                                 must be false → cannot self-reactivate.
--
-- NOTE: public.is_admin() is SECURITY DEFINER with search_path=public,
--   so it also bypasses RLS on profiles and avoids recursive evaluation.
create policy "profiles_self_or_admin_update"
on public.profiles
for update
using (auth.uid() = id or public.is_admin())
with check (
  -- Administrators bypass all column restrictions.
  public.is_admin()
  -- Non-admin users: own row only, role must stay 'customer',
  -- and is_active must not change (compared against live stored value).
  or (
    auth.uid() = id
    and role = 'customer'
    and is_active = public.get_profile_is_active(id)
  )
);

-- ============================================================
-- PART 2: ACTIVE-ACCOUNT CHECK HELPER
-- ============================================================

-- Create a SECURITY DEFINER helper to check if the current authenticated
-- user has an active account. Used by RPCs that need to enforce the
-- active-account boundary without recursive RLS evaluation.
create or replace function public.is_active_user()
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
      and p.is_active = true
  );
$$;

-- ============================================================
-- PART 3: PATCH create_order_with_items TO CHECK is_active
-- ============================================================

-- Re-create the RPC with the active-account check added after the
-- auth.uid() null check. This uses CREATE OR REPLACE, which is safe
-- for an already-deployed function (same signature, same grants).
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

  -- Active-account enforcement: suspended users cannot create orders
  if not public.is_active_user() then
    raise exception 'Account suspended. Order placement is not permitted.';
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

-- Re-apply grants (CREATE OR REPLACE preserves grants, but explicit is safer)
revoke all on function public.create_order_with_items(jsonb, jsonb, citext, text, text, jsonb) from public;
grant execute on function public.create_order_with_items(jsonb, jsonb, citext, text, text, jsonb) to authenticated;
