-- Migration 009: Robust Order Settlement & Auto-Fix Existing PayU Orders
-- 1. Updates apply_payu_result to return structured JSON with order details and ensures anon/service_role execute permissions.
-- 2. Immediately updates the 2 successful PayU orders from today to confirmed/paid.

-- Drop previous function signature to allow changing return type to jsonb
drop function if exists public.apply_payu_result(text, text, text, numeric, jsonb);

create or replace function public.apply_payu_result(
  p_txnid text,
  p_status text,            -- 'success' | 'pending' | 'failed' | 'cancelled'
  p_gateway_payment_id text,
  p_amount numeric,
  p_response jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  txn public.payment_transactions%rowtype;
  ord public.orders%rowtype;
  open_count integer;
begin
  select * into txn from public.payment_transactions where txnid = p_txnid for update;
  if not found then
    return jsonb_build_object('result', 'unknown_txn');
  end if;

  select * into ord from public.orders where id = txn.order_id for update;
  if not found then
    return jsonb_build_object('result', 'order_not_found');
  end if;

  -- Idempotency: already settled
  if txn.status = 'success' or ord.payment_status = 'paid' then
    return jsonb_build_object(
      'result', 'already_success',
      'order_number', ord.order_number,
      'order_id', ord.id
    );
  end if;

  if p_status = 'success' then
    -- Check amount match (allow tiny rounding differences)
    if p_amount is not null and abs(p_amount - ord.total_amount) > 1 then
      update public.payment_transactions
        set status = 'failed', failure_reason = 'amount_mismatch',
            gateway_payment_id = p_gateway_payment_id, gateway_response = p_response,
            verified_at = timezone('utc', now()), updated_at = timezone('utc', now())
        where id = txn.id;
      return jsonb_build_object('result', 'amount_mismatch', 'order_number', ord.order_number);
    end if;

    update public.payment_transactions
      set status = 'success', failure_reason = null, gateway_payment_id = p_gateway_payment_id,
          gateway_response = p_response, verified_at = timezone('utc', now()), updated_at = timezone('utc', now())
      where id = txn.id;

    update public.orders
      set payment_status = 'paid', payment_id = p_gateway_payment_id,
          status = case when ord.status = 'pending' then 'confirmed'::public.order_status else ord.status end,
          confirmed_at = case when ord.status = 'pending' then timezone('utc', now()) else ord.confirmed_at end,
          updated_at = timezone('utc', now())
      where id = ord.id;

    return jsonb_build_object(
      'result', 'success',
      'order_number', ord.order_number,
      'order_id', ord.id
    );

  elsif p_status = 'pending' then
    update public.payment_transactions
      set status = 'pending', gateway_payment_id = coalesce(p_gateway_payment_id, gateway_payment_id),
          gateway_response = p_response, updated_at = timezone('utc', now())
      where id = txn.id;
    return jsonb_build_object('result', 'pending', 'order_number', ord.order_number);

  else
    -- failed or cancelled
    update public.payment_transactions
      set status = case when p_status = 'cancelled' then 'cancelled' else 'failed' end,
          failure_reason = p_status, gateway_payment_id = coalesce(p_gateway_payment_id, gateway_payment_id),
          gateway_response = p_response, verified_at = timezone('utc', now()), updated_at = timezone('utc', now())
      where id = txn.id;

    if ord.status = 'pending' and ord.payment_status = 'pending' then
      update public.orders
        set status = 'cancelled', payment_status = 'failed',
            cancelled_at = timezone('utc', now()), updated_at = timezone('utc', now())
        where id = ord.id;
    end if;

    return jsonb_build_object('result', p_status, 'order_number', ord.order_number);
  end if;
end;
$$;

revoke all on function public.apply_payu_result(text, text, text, numeric, jsonb) from public;
grant execute on function public.apply_payu_result(text, text, text, numeric, jsonb) to authenticated, anon, service_role;

-- IMMEDIATELY UPDATE THE 2 SUCCESSFUL ORDERS AND 1 CANCELLED ORDER IN DATABASE
-- 1. Order #CRZ-20261103-100006 (Mohammed Rashid - ₹1)
update public.orders
set payment_status = 'paid',
    status = 'confirmed',
    payment_id = '31638870166',
    confirmed_at = coalesce(confirmed_at, timezone('utc', now())),
    updated_at = timezone('utc', now())
where order_number = 'CRZ-20261103-100006';

-- 2. Order #CRZ-20261103-100005 (Rinto joy - ₹1)
update public.orders
set payment_status = 'paid',
    status = 'confirmed',
    payment_id = '31637191545',
    confirmed_at = coalesce(confirmed_at, timezone('utc', now())),
    updated_at = timezone('utc', now())
where order_number = 'CRZ-20261103-100005';

-- 3. Order #CRZ-20261103-100004 (Mohammed Rashid - ₹299 - User Cancelled)
update public.orders
set payment_status = 'failed',
    status = 'cancelled',
    payment_id = '31636121659',
    cancelled_at = coalesce(cancelled_at, timezone('utc', now())),
    updated_at = timezone('utc', now())
where order_number = 'CRZ-20261103-100004' and status = 'pending';
