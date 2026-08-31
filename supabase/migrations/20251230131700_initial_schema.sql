-- Migration: 20251230131700_initial_schema
-- Description: Initial schema setup for profiles, price_alerts, and conversion_history with RLS and triggers.

-- 1. Create profiles table
create table public.profiles (
  id uuid not null references auth.users(id) on delete cascade primary key,
  email text,
  full_name text,
  avatar_url text,
  theme text default 'light',
  language text default 'en',
  updated_at timestamptz default now()
);
comment on table public.profiles is 'User profiles linked to auth.users';

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Policies for profiles
create policy "Users can view their own profile"
  on public.profiles for select
  to authenticated
  using ( (select auth.uid()) = id );

create policy "Users can update their own profile"
  on public.profiles for update
  to authenticated
  using ( (select auth.uid()) = id );

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$;

-- Trigger for new user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. Create price_alerts table
create table public.price_alerts (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  pair text not null,
  target_rate numeric not null,
  condition text check (condition in ('above', 'below')) not null,
  is_active boolean default true,
  created_at timestamptz default now()
);
comment on table public.price_alerts is 'User defined price alerts';

-- Enable RLS for price_alerts
alter table public.price_alerts enable row level security;

-- Policies for price_alerts
create policy "Users can view their own alerts"
  on public.price_alerts for select
  to authenticated
  using ( (select auth.uid()) = user_id );

create policy "Users can create their own alerts"
  on public.price_alerts for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );

create policy "Users can update their own alerts"
  on public.price_alerts for update
  to authenticated
  using ( (select auth.uid()) = user_id );

create policy "Users can delete their own alerts"
  on public.price_alerts for delete
  to authenticated
  using ( (select auth.uid()) = user_id );

-- 3. Create conversion_history table
create table public.conversion_history (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users(id) on delete cascade,
  from_currency text not null,
  to_currency text not null,
  amount numeric not null,
  rate numeric not null,
  result numeric not null,
  created_at timestamptz default now()
);
comment on table public.conversion_history is 'Log of currency conversions';

-- Enable RLS for conversion_history
alter table public.conversion_history enable row level security;

-- Policies for conversion_history
create policy "Users can view their own history"
  on public.conversion_history for select
  to authenticated
  using ( (select auth.uid()) = user_id );

create policy "Users can insert their own history"
  on public.conversion_history for insert
  to authenticated
  with check ( (select auth.uid()) = user_id );
