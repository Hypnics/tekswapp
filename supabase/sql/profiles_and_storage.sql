-- TekSwapp profiles + seller document storage

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  phone text,
  phone_verified boolean not null default false,
  country text,
  city text,
  address_line_1 text,
  postal_code text,
  avatar_url text,
  document_url text,
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'in_review', 'verified', 'rejected')),
  seller_enabled boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row
execute function public.set_updated_at();

-- Optional helper: auto-create a profile row on signup
create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
after insert on auth.users
for each row
execute function public.handle_new_user_profile();

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

create table if not exists public.owner_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.owner_accounts enable row level security;

drop policy if exists "profiles_select_owner" on public.profiles;
create policy "profiles_select_owner"
on public.profiles
for select
using (
  exists (
    select 1
    from public.owner_accounts
    where user_id = auth.uid()
  )
);

drop policy if exists "profiles_update_owner" on public.profiles;
create policy "profiles_update_owner"
on public.profiles
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

-- Staff access table for private moderation workflows
create table if not exists public.staff_accounts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

alter table public.staff_accounts enable row level security;

drop policy if exists "staff_accounts_select_own" on public.staff_accounts;
create policy "staff_accounts_select_own"
on public.staff_accounts
for select
using (auth.uid() = user_id);

-- Owner access table for highest-privilege controls
drop policy if exists "owner_accounts_select_own" on public.owner_accounts;
create policy "owner_accounts_select_own"
on public.owner_accounts
for select
using (auth.uid() = user_id);

drop policy if exists "staff_accounts_select_owner" on public.staff_accounts;
create policy "staff_accounts_select_owner"
on public.staff_accounts
for select
using (
  exists (
    select 1
    from public.owner_accounts
    where user_id = auth.uid()
  )
);

drop policy if exists "staff_accounts_insert_owner" on public.staff_accounts;
create policy "staff_accounts_insert_owner"
on public.staff_accounts
for insert
with check (
  exists (
    select 1
    from public.owner_accounts
    where user_id = auth.uid()
  )
);

drop policy if exists "staff_accounts_update_owner" on public.staff_accounts;
create policy "staff_accounts_update_owner"
on public.staff_accounts
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

drop policy if exists "staff_accounts_delete_owner" on public.staff_accounts;
create policy "staff_accounts_delete_owner"
on public.staff_accounts
for delete
using (
  exists (
    select 1
    from public.owner_accounts
    where user_id = auth.uid()
  )
);

-- Storage bucket for optional seller verification docs
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'seller-documents',
  'seller-documents',
  false,
  10485760,
  array['application/pdf', 'image/png', 'image/jpeg']
)
on conflict (id) do nothing;

drop policy if exists "seller_docs_select_own" on storage.objects;
create policy "seller_docs_select_own"
on storage.objects
for select
using (
  bucket_id = 'seller-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "seller_docs_insert_own" on storage.objects;
create policy "seller_docs_insert_own"
on storage.objects
for insert
with check (
  bucket_id = 'seller-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "seller_docs_update_own" on storage.objects;
create policy "seller_docs_update_own"
on storage.objects
for update
using (
  bucket_id = 'seller-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'seller-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "seller_docs_delete_own" on storage.objects;
create policy "seller_docs_delete_own"
on storage.objects
for delete
using (
  bucket_id = 'seller-documents'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage bucket for seller listing images (publicly viewable marketplace photos)
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'listing-images',
  'listing-images',
  true,
  8388608,
  array['image/png', 'image/jpeg', 'image/jpg', 'image/webp']
)
on conflict (id) do nothing;

drop policy if exists "listing_images_insert_own" on storage.objects;
create policy "listing_images_insert_own"
on storage.objects
for insert
with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "listing_images_update_own" on storage.objects;
create policy "listing_images_update_own"
on storage.objects
for update
using (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = auth.uid()::text
)
with check (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "listing_images_delete_own" on storage.objects;
create policy "listing_images_delete_own"
on storage.objects
for delete
using (
  bucket_id = 'listing-images'
  and (storage.foldername(name))[1] = auth.uid()::text
);

-- Marketplace listings table used by /sell and /listings pages
create table if not exists public.listings (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references auth.users (id) on delete cascade,
  seller_name text not null,
  seller_verified boolean not null default false,
  seller_rating numeric(3,2) not null default 5,
  seller_total_sales integer not null default 0,
  title text not null,
  category text not null check (category in ('Phones', 'Tablets', 'Laptops', 'Consoles', 'Wearables', 'Audio', 'Other')),
  brand text not null,
  model text not null,
  price numeric(10,2) not null check (price > 0),
  original_price numeric(10,2),
  condition text not null check (condition in ('New', 'Like New', 'Excellent', 'Good', 'Fair', 'For Parts / Not Working')),
  storage text,
  battery_health integer check (battery_health is null or (battery_health >= 0 and battery_health <= 100)),
  color text,
  image text,
  image_url text,
  images jsonb not null default '[]'::jsonb,
  verified boolean not null default false,
  description text not null,
  imei_status text check (imei_status in ('Clean', 'Reported', 'Unknown')),
  seller_notes text,
  device_specs jsonb not null default '{}'::jsonb,
  status text not null default 'pending_review'
    check (status in ('active', 'draft', 'sold', 'pending_review', 'paused')),
  views integer not null default 0,
  watchers integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.listings
alter column status set default 'pending_review';

drop trigger if exists set_listings_updated_at on public.listings;
create trigger set_listings_updated_at
before update on public.listings
for each row
execute function public.set_updated_at();

create index if not exists listings_status_created_at_idx on public.listings (status, created_at desc);
create index if not exists listings_category_created_at_idx on public.listings (category, created_at desc);
create index if not exists listings_seller_id_idx on public.listings (seller_id);

alter table public.listings enable row level security;

drop policy if exists "listings_select_public_active_or_owner" on public.listings;
create policy "listings_select_public_active_or_owner"
on public.listings
for select
using (status = 'active' or auth.uid() = seller_id);

drop policy if exists "listings_select_staff" on public.listings;
create policy "listings_select_staff"
on public.listings
for select
using (
  exists (
    select 1
    from public.staff_accounts
    where user_id = auth.uid()
  )
);

drop policy if exists "listings_select_owner" on public.listings;
create policy "listings_select_owner"
on public.listings
for select
using (
  exists (
    select 1
    from public.owner_accounts
    where user_id = auth.uid()
  )
);

drop policy if exists "listings_insert_own" on public.listings;
create policy "listings_insert_own"
on public.listings
for insert
with check (auth.uid() = seller_id);

drop policy if exists "listings_update_own" on public.listings;
create policy "listings_update_own"
on public.listings
for update
using (auth.uid() = seller_id)
with check (auth.uid() = seller_id);

drop policy if exists "listings_update_staff" on public.listings;
create policy "listings_update_staff"
on public.listings
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

drop policy if exists "listings_update_owner" on public.listings;
create policy "listings_update_owner"
on public.listings
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

drop policy if exists "listings_delete_own" on public.listings;
create policy "listings_delete_own"
on public.listings
for delete
using (auth.uid() = seller_id);

drop policy if exists "listings_delete_owner" on public.listings;
create policy "listings_delete_owner"
on public.listings
for delete
using (
  exists (
    select 1
    from public.owner_accounts
    where user_id = auth.uid()
  )
);

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
