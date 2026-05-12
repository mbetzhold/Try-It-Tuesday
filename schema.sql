-- ─────────────────────────────────────────────────────────
--  Fresh Tuesday Challenge — Supabase Database Setup
--
--  HOW TO USE:
--  1. Go to supabase.com → your project → SQL Editor
--  2. Click "New Query"
--  3. Paste ALL of this in and click "Run"
--  That's it! Your database is ready.
-- ─────────────────────────────────────────────────────────


-- TABLE 1: profiles
-- Stores each employee's name and email
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null,
  email text,
  created_at timestamp with time zone default now()
);


-- TABLE 2: entries
-- Stores every item each person has tried, and which week
create table if not exists entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  week integer not null check (week between 1 and 4),
  item_name text not null,
  is_bonus boolean default false,
  points integer default 10,
  created_at timestamp with time zone default now()
);


-- ─────────────────────────────────────────────────────────
--  SECURITY (Row Level Security)
--  This makes sure people can only edit THEIR OWN entries
--  but everyone can SEE the leaderboard
-- ─────────────────────────────────────────────────────────

-- Turn on security for both tables
alter table profiles enable row level security;
alter table entries enable row level security;

-- PROFILES: anyone logged in can read all profiles (needed for leaderboard names)
create policy "Anyone can read profiles"
  on profiles for select
  using (auth.role() = 'authenticated');

-- PROFILES: users can only insert/update their own profile
create policy "Users manage own profile"
  on profiles for all
  using (auth.uid() = id);

-- ENTRIES: anyone logged in can read all entries (leaderboard)
create policy "Anyone can read entries"
  on entries for select
  using (auth.role() = 'authenticated');

-- ENTRIES: users can only insert/delete their own entries
create policy "Users manage own entries"
  on entries for all
  using (auth.uid() = user_id);


-- ─────────────────────────────────────────────────────────
--  AUTO-CREATE PROFILE ON SIGNUP
--  When someone creates an account, this automatically
--  adds them to the profiles table
-- ─────────────────────────────────────────────────────────
create or replace function handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure handle_new_user();
