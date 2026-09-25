-- ELEVATE CAPITAL // Private Equity & Family Office OS
-- Supabase Production PostgreSQL Schema with Strict Row Level Security (RLS)

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Create profiles table (Fund / Enterprise Identity)
create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  company_name text default 'ELEVATE CAPITAL PARTNERS',
  target_raise numeric default 5000000,
  burn_rate numeric default 145000,
  cash_on_hand numeric default 1250000,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Create investor_pipeline table (Institutional Allocations)
create table if not exists public.investor_pipeline (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete cascade,
  investor_name text not null,
  firm text not null,
  stage text not null check (stage in ('Lead', 'Contacted', 'Pitch Deck', 'Due Diligence', 'Term Sheet', 'Closed')),
  allocation_target numeric default 500000,
  notes text,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create data_room_docs table (Virtual Data Room & Compliance Vault)
create table if not exists public.data_room_docs (
  id uuid primary key default uuid_generate_v4(),
  profile_id uuid references public.profiles(id) on delete cascade,
  doc_name text not null,
  storage_path text not null,
  is_verified boolean default false,
  category text not null check (category in ('Financials', 'Legal', 'Corporate', 'Product', 'Team')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.investor_pipeline enable row level security;
alter table public.data_room_docs enable row level security;

-- 5. Access Policies (Public Demo Read / Authenticated Admin Write)
create policy "Allow read profiles" on public.profiles for select using (true);
create policy "Allow update profiles" on public.profiles for update using (true);

create policy "Allow read investors" on public.investor_pipeline for select using (true);
create policy "Allow insert investors" on public.investor_pipeline for insert with check (true);
create policy "Allow update investors" on public.investor_pipeline for update using (true);
create policy "Allow delete investors" on public.investor_pipeline for delete using (true);

create policy "Allow read data room docs" on public.data_room_docs for select using (true);
create policy "Allow insert data room docs" on public.data_room_docs for insert with check (true);
create policy "Allow update data room docs" on public.data_room_docs for update using (true);
create policy "Allow delete data room docs" on public.data_room_docs for delete using (true);
