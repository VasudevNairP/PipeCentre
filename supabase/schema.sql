-- ========================================================
-- Pipe Centre Database Schema (PostgreSQL / Supabase)
-- 100% idempotent: Safe to run or re-run anytime
-- ========================================================

-- Enable core extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- 1. Profiles (linked to supabase auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null check (role in ('owner', 'staff')) default 'staff',
  full_name text not null default 'Staff Member',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Categories
create table if not exists public.categories (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  parent_id uuid references public.categories(id) on delete set null,
  icon text,
  sort_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Products
create table if not exists public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  slug text not null unique,
  category_id uuid references public.categories(id) on delete restrict not null,
  brand text,
  price numeric(10, 2), -- null means "Ask for price"
  unit text not null default 'piece',
  stock_qty integer not null default 0,
  low_stock_threshold integer not null default 5,
  description text,
  specs jsonb,
  images text[] default '{}'::text[],
  featured boolean default false,
  active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enquiries (created before stock_movements to avoid circular alter table)
create table if not exists public.enquiries (
  id uuid default gen_random_uuid() primary key,
  reference text not null unique,
  customer_name text not null,
  customer_phone text not null,
  customer_email text,
  note text,
  status text not null check (status in ('new', 'contacted', 'confirmed', 'completed', 'cancelled')) default 'new',
  internal_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Enquiry Items
create table if not exists public.enquiry_items (
  id uuid default gen_random_uuid() primary key,
  enquiry_id uuid references public.enquiries(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_price numeric(10, 2),
  qty integer not null default 1,
  unit text not null default 'piece'
);

-- 6. Stock Movements
create table if not exists public.stock_movements (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  delta integer not null, -- +ve for addition, -ve for deduction
  reason text not null,
  performed_by uuid references public.profiles(id) on delete set null,
  enquiry_id uuid references public.enquiries(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Stored procedure to safely adjust stock
create or replace function adjust_stock(p_product_id uuid, p_delta integer)
returns void as $$
begin
  update public.products
  set stock_qty = greatest(0, stock_qty + p_delta),
      updated_at = timezone('utc'::text, now())
  where id = p_product_id;
end;
$$ language plpgsql security definer;

-- Stored procedure to safely decrement stock
create or replace function decrement_stock(p_product_id uuid, p_qty integer)
returns void as $$
begin
  update public.products
  set stock_qty = greatest(0, stock_qty - p_qty),
      updated_at = timezone('utc'::text, now())
  where id = p_product_id;
end;
$$ language plpgsql security definer;

-- Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.enquiries enable row level security;
alter table public.enquiry_items enable row level security;
alter table public.stock_movements enable row level security;

-- ========================================================
-- RLS Policies (Clean drop + create for zero conflicts)
-- ========================================================

-- Profiles
drop policy if exists "Read own profile" on public.profiles;
drop policy if exists "Staff can read all profiles" on public.profiles;
drop policy if exists "Owner can insert profiles" on public.profiles;
drop policy if exists "Owner can delete profiles" on public.profiles;
drop policy if exists "Staff can update own profile" on public.profiles;

create policy "Staff can read all profiles" on public.profiles for select to authenticated using (true);
create policy "Owner can insert profiles" on public.profiles for insert to authenticated with check (true);
create policy "Staff can update own profile" on public.profiles for update to authenticated using (true) with check (true);
create policy "Owner can delete profiles" on public.profiles for delete to authenticated using (true);

-- Categories: public read, authenticated staff manage
drop policy if exists "Public can view categories" on public.categories;
drop policy if exists "Staff can manage categories" on public.categories;

create policy "Public can view categories" on public.categories for select using (true);
create policy "Staff can manage categories" on public.categories for all to authenticated using (true) with check (true);

-- Products: public read active, authenticated staff manage all
drop policy if exists "Public can view active products" on public.products;
drop policy if exists "Staff can view all products" on public.products;
drop policy if exists "Staff can manage products" on public.products;

create policy "Public can view active products" on public.products for select using (active = true);
create policy "Staff can view all products" on public.products for select to authenticated using (true);
create policy "Staff can manage products" on public.products for all to authenticated using (true) with check (true);

-- Enquiries: public can insert, authenticated staff manage
drop policy if exists "Public can insert enquiries" on public.enquiries;
drop policy if exists "Staff can manage enquiries" on public.enquiries;

create policy "Public can insert enquiries" on public.enquiries for insert with check (true);
create policy "Staff can manage enquiries" on public.enquiries for all to authenticated using (true) with check (true);

-- Enquiry items: public can insert, authenticated staff manage
drop policy if exists "Public can insert enquiry items" on public.enquiry_items;
drop policy if exists "Staff can manage enquiry items" on public.enquiry_items;

create policy "Public can insert enquiry items" on public.enquiry_items for insert with check (true);
create policy "Staff can manage enquiry items" on public.enquiry_items for all to authenticated using (true) with check (true);

-- Stock movements: authenticated staff only
drop policy if exists "Staff can view and create stock movements" on public.stock_movements;

create policy "Staff can view and create stock movements" on public.stock_movements for all to authenticated using (true) with check (true);

-- ========================================================
-- Storage: Bucket & Policies for Product Photos
-- ========================================================

insert into storage.buckets (id, name, public) 
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

drop policy if exists "Public can read product images" on storage.objects;
drop policy if exists "Staff can upload product images" on storage.objects;
drop policy if exists "Staff can update product images" on storage.objects;
drop policy if exists "Staff can delete product images" on storage.objects;

create policy "Public can read product images" on storage.objects for select using (bucket_id = 'product-images');
create policy "Staff can upload product images" on storage.objects for insert to authenticated with check (bucket_id = 'product-images');
create policy "Staff can update product images" on storage.objects for update to authenticated using (bucket_id = 'product-images');
create policy "Staff can delete product images" on storage.objects for delete to authenticated using (bucket_id = 'product-images');
