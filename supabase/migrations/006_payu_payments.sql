-- PayU payment transactions + atomic, idempotent settlement function.

create table if not exists public.payment_transactions (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders (id) on delete restrict,
  gateway text not null default 'payu',
  txnid text not null unique,
  amount numeric(12,2) not null check (amount > 0),
  status text not null default 'initiated'
    check (status in ('initiated', 'pending', 'success', 'failed', 'cancelled', 'duplicate')),
  gateway_payment_id text,
  gateway_response jsonb,
  failure_reason text,
  verified_at timestamptz,
  created_at timestamptz not null default timezone('utc', now()),
  updated_at timestamptz not null default timezone('utc', now())
);

create index if not exists idx_payment_transactions_order on public.payment_transactions (order_id);

-- At most one successful payment per order (duplicate payment protection).
create unique index if not exists uq_payment_transactions_one_success
  on public.payment_transactions (order_id) where status = 'success';

alter table public.payment_transactions enable row level security;

-- Function to securely initiate payment transaction even when using publishable or service keys
create or replace function public.prepare_payu_payment(
  p_order_id uuid,
  p_txnid text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  ord public.orders%rowtype;
  amount_str text;
begin
  select * into ord from public.orders where id = p_order_id for update;
  if not found then
    return jsonb_build_object('error', 'Order not found');
  end if;

  if ord.user_id is not null then
    if auth.uid() is null or (auth.uid() <> ord.user_id and not public.is_admin()) then
      return jsonb_build_object('error', 'Unauthorized');
    end if;
  end if;

  if ord.payment_method <> 'online' then
    return jsonb_build_object('error', 'Order is not an online payment order');
  end if;

  if ord.payment_status = 'paid' then
    return jsonb_build_object('error', 'Order is already paid');
  end if;

  if ord.status <> 'pending' or ord.payment_status <> 'pending' then
    return jsonb_build_object('error', 'Order is not payable');
  end if;

  amount_str := to_char(ord.total_amount, 'FM999999990.00');

  -- Close superseded initiated attempts
  update public.payment_transactions
    set status = 'cancelled', failure_reason = 'superseded', updated_at = timezone('utc', now())
    where order_id = ord.id and status = 'initiated';

  -- Insert payment transaction
  insert into public.payment_transactions (
    order_id,
    txnid,
    amount,
    status
  ) values (
    ord.id,
    p_txnid,
    ord.total_amount,
    'initiated'
  );

  return jsonb_build_object(
    'success', true,
    'order_id', ord.id,
    'order_number', ord.order_number,
    'amount', amount_str,
    'shipping_address', ord.shipping_address
  );
end;
$$;

revoke all on function public.prepare_payu_payment(uuid, text) from public;
grant execute on function public.prepare_payu_payment(uuid, text) to authenticated, anon, service_role;

create or replace function public.apply_payu_result(
  p_txnid text,
  p_status text,            -- 'success' | 'pending' | 'failed' | 'cancelled' (already verified server-side)
  p_gateway_payment_id text,
  p_amount numeric,
  p_response jsonb
)
returns text
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
    return 'unknown_txn';
  end if;

  -- Final states are never re-processed (idempotency).
  if txn.status in ('success', 'duplicate') then
    return 'already_' || txn.status;
  end if;

  select * into ord from public.orders where id = txn.order_id for update;

  if p_status = 'success' then
    if p_amount is null or p_amount <> txn.amount or p_amount <> ord.total_amount then
      update public.payment_transactions
        set status = 'failed', failure_reason = 'amount_mismatch',
            gateway_payment_id = p_gateway_payment_id, gateway_response = p_response,
            verified_at = timezone('utc', now()), updated_at = timezone('utc', now())
        where id = txn.id;
      update public.orders
        set admin_notes = coalesce(admin_notes || E'\n', '') ||
          'PAYU AMOUNT MISMATCH txn ' || p_txnid || ' mihpayid ' || coalesce(p_gateway_payment_id, '-') || ' - review manually.',
            updated_at = timezone('utc', now())
        where id = ord.id;
      return 'amount_mismatch';
    end if;

    if ord.payment_status = 'paid' then
      update public.payment_transactions
        set status = 'duplicate', gateway_payment_id = p_gateway_payment_id, gateway_response = p_response,
            verified_at = timezone('utc', now()), updated_at = timezone('utc', now())
        where id = txn.id;
      update public.orders
        set admin_notes = coalesce(admin_notes || E'\n', '') ||
          'DUPLICATE PAYU PAYMENT txn ' || p_txnid || ' mihpayid ' || coalesce(p_gateway_payment_id, '-') || ' - REFUND REQUIRED.',
            updated_at = timezone('utc', now())
        where id = ord.id;
      return 'duplicate';
    end if;

    update public.payment_transactions
      set status = 'success', failure_reason = null, gateway_payment_id = p_gateway_payment_id,
          gateway_response = p_response, verified_at = timezone('utc', now()), updated_at = timezone('utc', now())
      where id = txn.id;

    if ord.status = 'cancelled' then
      -- Money received for an order that was already cancelled (stock released).
      update public.orders
        set payment_status = 'paid', payment_id = p_gateway_payment_id,
            admin_notes = coalesce(admin_notes || E'\n', '') ||
              'PAYU PAYMENT RECEIVED AFTER CANCELLATION txn ' || p_txnid || ' mihpayid ' || coalesce(p_gateway_payment_id, '-') || ' - REFUND REQUIRED.',
            updated_at = timezone('utc', now())
        where id = ord.id;
      return 'success_order_cancelled';
    end if;

    update public.orders
      set payment_status = 'paid', payment_id = p_gateway_payment_id,
          status = case when ord.status = 'pending' then 'confirmed'::public.order_status else ord.status end,
          confirmed_at = case when ord.status = 'pending' then timezone('utc', now()) else ord.confirmed_at end,
          updated_at = timezone('utc', now())
      where id = ord.id;
    return 'success';

  elsif p_status = 'pending' then
    update public.payment_transactions
      set status = 'pending', gateway_payment_id = coalesce(p_gateway_payment_id, gateway_payment_id),
          gateway_response = p_response, updated_at = timezone('utc', now())
      where id = txn.id;
    return 'pending';

  else
    update public.payment_transactions
      set status = case when p_status = 'cancelled' then 'cancelled' else 'failed' end,
          failure_reason = p_status, gateway_payment_id = coalesce(p_gateway_payment_id, gateway_payment_id),
          gateway_response = p_response, verified_at = timezone('utc', now()), updated_at = timezone('utc', now())
      where id = txn.id;

    select count(*) into open_count from public.payment_transactions
      where order_id = ord.id and id <> txn.id and status in ('initiated', 'pending', 'success');

    -- Cancel the unpaid order (the existing inventory trigger restocks it).
    if open_count = 0 and ord.status = 'pending' and ord.payment_status = 'pending' then
      update public.orders
        set status = 'cancelled', payment_status = 'failed',
            cancelled_at = timezone('utc', now()), updated_at = timezone('utc', now())
        where id = ord.id;
    end if;
    return case when p_status = 'cancelled' then 'cancelled' else 'failed' end;
  end if;
end;
$$;

revoke all on function public.apply_payu_result(text, text, text, numeric, jsonb) from public;
grant execute on function public.apply_payu_result(text, text, text, numeric, jsonb) to authenticated, anon, service_role;
