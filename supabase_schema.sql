-- ==============================================================
-- SAWITPRO ERP OPERASIONAL SAWIT - DATABASE SCHEMA (SUPABASE POSTGRESQL)
-- Salin dan jalankan seluruh SQL ini di: Supabase Dashboard -> SQL Editor
-- ==============================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. TABEL PROFILES (Akun Pemilik Kebun)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  phone text,
  currency text default 'IDR',
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 3. TABEL FARMS (Master Kebun)
create table if not exists public.farms (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  owner_name text not null,
  total_area_ha numeric(8,2) not null check (total_area_ha > 0),
  location text,
  planted_year integer,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null,
  updated_at timestamptz default timezone('utc'::text, now()) not null
);

-- 4. TABEL FARM_BLOCKS (Blok Kebun)
create table if not exists public.farm_blocks (
  id uuid primary key default gen_random_uuid(),
  farm_id uuid not null references public.farms(id) on delete cascade,
  block_name text not null,
  area_ha numeric(8,2) not null check (area_ha > 0),
  planted_year integer,
  tree_count integer check (tree_count >= 0),
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 5. TABEL WORKERS (Pekerja & Sopir)
create table if not exists public.workers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  role text not null check (role in ('pemanen', 'sopir', 'pemupuk', 'mandor', 'lainnya')),
  phone text,
  default_rate_per_kg numeric(12,2) default 250 check (default_rate_per_kg >= 0),
  default_rate_per_day numeric(12,2) default 0 check (default_rate_per_day >= 0),
  vehicle_number text,
  is_active boolean default true,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 6. TABEL HARVEST_TRANSACTIONS (Transaksi Panen)
create table if not exists public.harvest_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  farm_id uuid not null references public.farms(id),
  block_id uuid references public.farm_blocks(id),
  harvest_date date default current_date not null,
  
  total_weight_kg numeric(12,2) not null check (total_weight_kg > 0),
  price_per_kg numeric(12,2) not null check (price_per_kg >= 0),
  gross_income numeric(14,2) generated always as (total_weight_kg * price_per_kg) stored,

  driver_id uuid references public.workers(id),
  driver_rate_per_kg numeric(12,2) default 0 check (driver_rate_per_kg >= 0),
  transport_cost numeric(14,2) generated always as (total_weight_kg * driver_rate_per_kg) stored,

  buyer_ram_name text,
  receipt_number text,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 7. TABEL HARVEST_HARVESTERS (Rincian Pemanen per Panen, Multi-Pemanen)
create table if not exists public.harvest_harvesters (
  id uuid primary key default gen_random_uuid(),
  harvest_id uuid not null references public.harvest_transactions(id) on delete cascade,
  worker_id uuid not null references public.workers(id),
  weight_kg numeric(12,2) not null check (weight_kg >= 0),
  rate_per_kg numeric(12,2) not null check (rate_per_kg >= 0),
  total_wage numeric(14,2) generated always as (weight_kg * rate_per_kg) stored,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 8. TABEL FERTILIZATION_RECORDS (Catatan Pemupukan)
create table if not exists public.fertilization_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  farm_id uuid not null references public.farms(id),
  block_id uuid references public.farm_blocks(id),
  date date default current_date not null,
  
  fertilizer_name text not null,
  quantity numeric(10,2) not null check (quantity > 0),
  unit text default 'sak (50kg)' not null,
  price_per_unit numeric(12,2) not null check (price_per_unit >= 0),
  material_cost numeric(14,2) generated always as (quantity * price_per_unit) stored,
  
  worker_name text,
  labor_cost numeric(14,2) default 0 not null check (labor_cost >= 0),
  total_cost numeric(14,2) generated always as ((quantity * price_per_unit) + labor_cost) stored,
  notes text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 9. TABEL EXPENSES (Biaya Operasional)
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  farm_id uuid not null references public.farms(id),
  block_id uuid references public.farm_blocks(id),
  date date default current_date not null,
  
  category text not null check (category in (
    'pupuk', 'jasa_pemupukan', 'jasa_panen', 'jasa_angkut',
    'bbm', 'perawatan_rumput', 'alat_kerja', 'konsumsi', 'lainnya'
  )),
  amount numeric(14,2) not null check (amount > 0),
  description text not null,
  recipient_name text,
  created_at timestamptz default timezone('utc'::text, now()) not null
);

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
alter table public.profiles enable row level security;
alter table public.farms enable row level security;
alter table public.farm_blocks enable row level security;
alter table public.workers enable row level security;
alter table public.harvest_transactions enable row level security;
alter table public.harvest_harvesters enable row level security;
alter table public.fertilization_records enable row level security;
alter table public.expenses enable row level security;

-- Policies for profiles
create policy "Users can view and edit own profile" on public.profiles
  for all using (auth.uid() = id);

-- Policies for farms
create policy "Users can manage own farms" on public.farms
  for all using (auth.uid() = user_id);

-- Policies for farm_blocks
create policy "Users can manage own blocks" on public.farm_blocks
  for all using (exists (
    select 1 from public.farms where farms.id = farm_blocks.farm_id and farms.user_id = auth.uid()
  ));

-- Policies for workers
create policy "Users can manage own workers" on public.workers
  for all using (auth.uid() = user_id);

-- Policies for harvest_transactions
create policy "Users can manage own harvests" on public.harvest_transactions
  for all using (auth.uid() = user_id);

-- Policies for harvest_harvesters
create policy "Users can manage own harvest_harvesters" on public.harvest_harvesters
  for all using (exists (
    select 1 from public.harvest_transactions where harvest_transactions.id = harvest_harvesters.harvest_id and harvest_transactions.user_id = auth.uid()
  ));

-- Policies for fertilization_records
create policy "Users can manage own fertilizations" on public.fertilization_records
  for all using (auth.uid() = user_id);

-- Policies for expenses
create policy "Users can manage own expenses" on public.expenses
  for all using (auth.uid() = user_id);
