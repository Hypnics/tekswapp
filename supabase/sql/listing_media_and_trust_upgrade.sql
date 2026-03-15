alter table public.listings
  add column if not exists images jsonb not null default '[]'::jsonb;

update public.listings
set images = case
  when jsonb_typeof(images) = 'array' and jsonb_array_length(images) > 0 then images
  when coalesce(nullif(image, ''), nullif(image_url, '')) is not null
    then jsonb_build_array(coalesce(nullif(image, ''), nullif(image_url, '')))
  else '[]'::jsonb
end;

update public.listings
set image = coalesce(nullif(image, ''), images->>0, nullif(image_url, '')),
    image_url = coalesce(nullif(image_url, ''), nullif(image, ''), images->>0);

update public.listings
set condition = 'Fair'
where condition = 'Poor';

alter table public.listings
  drop constraint if exists listings_condition_check;

alter table public.listings
  add constraint listings_condition_check
  check (condition in ('New', 'Like New', 'Excellent', 'Good', 'Fair', 'For Parts / Not Working'));

create table if not exists public.listing_private_details (
  listing_id uuid primary key references public.listings (id) on delete cascade,
  seller_id uuid not null references auth.users (id) on delete cascade,
  imei text,
  serial_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists listing_private_details_seller_id_idx
  on public.listing_private_details (seller_id);

drop trigger if exists set_listing_private_details_updated_at on public.listing_private_details;
create trigger set_listing_private_details_updated_at
before update on public.listing_private_details
for each row
execute function public.set_updated_at();

alter table public.listing_private_details enable row level security;

drop policy if exists "listing_private_details_select_own" on public.listing_private_details;
create policy "listing_private_details_select_own"
on public.listing_private_details
for select
using (auth.uid() = seller_id);

drop policy if exists "listing_private_details_insert_own" on public.listing_private_details;
create policy "listing_private_details_insert_own"
on public.listing_private_details
for insert
with check (auth.uid() = seller_id);

drop policy if exists "listing_private_details_update_own" on public.listing_private_details;
create policy "listing_private_details_update_own"
on public.listing_private_details
for update
using (auth.uid() = seller_id)
with check (auth.uid() = seller_id);

drop policy if exists "listing_private_details_delete_own" on public.listing_private_details;
create policy "listing_private_details_delete_own"
on public.listing_private_details
for delete
using (auth.uid() = seller_id);

drop policy if exists "listing_private_details_select_staff" on public.listing_private_details;
create policy "listing_private_details_select_staff"
on public.listing_private_details
for select
using (
  exists (
    select 1
    from public.staff_accounts
    where user_id = auth.uid()
  )
);

drop policy if exists "listing_private_details_select_owner" on public.listing_private_details;
create policy "listing_private_details_select_owner"
on public.listing_private_details
for select
using (
  exists (
    select 1
    from public.owner_accounts
    where user_id = auth.uid()
  )
);

drop policy if exists "listing_private_details_update_staff" on public.listing_private_details;
create policy "listing_private_details_update_staff"
on public.listing_private_details
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

drop policy if exists "listing_private_details_update_owner" on public.listing_private_details;
create policy "listing_private_details_update_owner"
on public.listing_private_details
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
