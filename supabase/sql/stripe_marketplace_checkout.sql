alter table public.listings
  add column if not exists currency_code text not null default 'USD',
  add column if not exists shipping_mode text not null default 'none',
  add column if not exists shipping_profile jsonb not null default '{}'::jsonb;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'listings_currency_code_check'
      and conrelid = 'public.listings'::regclass
  ) then
    alter table public.listings
      add constraint listings_currency_code_check check (currency_code in ('USD'));
  end if;
end
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'listings_shipping_mode_check'
      and conrelid = 'public.listings'::regclass
  ) then
    alter table public.listings
      add constraint listings_shipping_mode_check check (shipping_mode in ('none', 'basic', 'advanced'));
  end if;
end
$$;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  listing_id uuid not null references public.listings (id) on delete restrict,
  listing_title text not null,
  item_title text not null,
  seller_id uuid not null references auth.users (id) on delete restrict,
  seller_name text not null,
  buyer_id uuid not null references auth.users (id) on delete restrict,
  buyer_name text not null,
  buyer_handle text,
  status text not null default 'processing'
    check (status in ('processing', 'shipped', 'delivered')),
  shipping_status text not null default 'label_created'
    check (shipping_status in ('label_created', 'in_transit', 'delivered')),
  payout_status text not null default 'on_hold'
    check (payout_status in ('on_hold', 'processing', 'released')),
  tracking_code text,
  total_amount numeric(10,2) not null default 0,
  subtotal_amount numeric(10,2) not null default 0,
  shipping_amount numeric(10,2) not null default 0,
  tax_amount numeric(10,2) not null default 0,
  marketplace_fee_amount numeric(10,2) not null default 0,
  seller_net_amount numeric(10,2) not null default 0,
  currency_code text not null default 'USD',
  shipping_country_code text,
  shipping_country text,
  shipping_rate_label text,
  stripe_session_id text not null unique,
  stripe_payment_intent_id text,
  stripe_payment_status text,
  stripe_customer_email text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.listing_checkout_reservations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null unique references public.listings (id) on delete cascade,
  buyer_id uuid not null references auth.users (id) on delete cascade,
  stripe_session_id text unique,
  checkout_url text,
  shipping_country_code text,
  reserved_until timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'orders_currency_code_check'
      and conrelid = 'public.orders'::regclass
  ) then
    alter table public.orders
      add constraint orders_currency_code_check check (char_length(currency_code) = 3);
  end if;
end
$$;

drop trigger if exists set_orders_updated_at on public.orders;
create trigger set_orders_updated_at
before update on public.orders
for each row
execute function public.set_updated_at();

drop trigger if exists set_listing_checkout_reservations_updated_at on public.listing_checkout_reservations;
create trigger set_listing_checkout_reservations_updated_at
before update on public.listing_checkout_reservations
for each row
execute function public.set_updated_at();

create index if not exists orders_seller_id_created_at_idx on public.orders (seller_id, created_at desc);
create index if not exists orders_buyer_id_created_at_idx on public.orders (buyer_id, created_at desc);
create index if not exists orders_listing_id_idx on public.orders (listing_id);
create index if not exists listing_checkout_reservations_buyer_id_idx on public.listing_checkout_reservations (buyer_id);
create index if not exists listing_checkout_reservations_reserved_until_idx on public.listing_checkout_reservations (reserved_until);

alter table public.orders enable row level security;

drop policy if exists "orders_select_participants" on public.orders;
create policy "orders_select_participants"
on public.orders
for select
using (auth.uid() = buyer_id or auth.uid() = seller_id);

drop policy if exists "orders_select_staff" on public.orders;
create policy "orders_select_staff"
on public.orders
for select
using (
  exists (
    select 1
    from public.staff_accounts
    where user_id = auth.uid()
  )
);

drop policy if exists "orders_select_owner" on public.orders;
create policy "orders_select_owner"
on public.orders
for select
using (
  exists (
    select 1
    from public.owner_accounts
    where user_id = auth.uid()
  )
);

drop policy if exists "orders_update_seller" on public.orders;
create policy "orders_update_seller"
on public.orders
for update
using (auth.uid() = seller_id)
with check (auth.uid() = seller_id);

drop policy if exists "orders_update_staff" on public.orders;
create policy "orders_update_staff"
on public.orders
for update
using (
  exists (
    select 1
    from public.staff_accounts
    where user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.staff_accounts
    where user_id = auth.uid()
  )
);

drop policy if exists "orders_update_owner" on public.orders;
create policy "orders_update_owner"
on public.orders
for update
using (
  exists (
    select 1
    from public.owner_accounts
    where user_id = auth.uid()
  )
)
with check (
  exists (
    select 1
    from public.owner_accounts
    where user_id = auth.uid()
  )
);
