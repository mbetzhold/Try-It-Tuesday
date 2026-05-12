-- ─────────────────────────────────────────────────────────
--  Fresh Tuesday Challenge — Supabase Database Setup
--  (No login version)
--
--  HOW TO USE:
--  1. Go to supabase.com → your project → SQL Editor
--  2. Click "New Query"
--  3. Paste ALL of this in and click "Run"
-- ─────────────────────────────────────────────────────────


-- Drop old tables if you ran the previous version
drop table if exists entries;
drop table if exists profiles;


-- TABLE: entries
-- Stores every item each person has tried
-- player_id is a random ID saved in their browser (no account needed)
create table entries (
  id          uuid primary key default gen_random_uuid(),
  player_id   text not null,
  player_name text not null,
  week        integer not null check (week between 1 and 4),
  item_name   text not null,
  is_bonus    boolean default false,
  points      integer default 10,
  created_at  timestamp with time zone default now()
);


-- ─────────────────────────────────────────────────────────
--  SECURITY
--  Since there's no login, we allow anyone to read
--  and insert entries (it's an internal company game)
-- ─────────────────────────────────────────────────────────

alter table entries enable row level security;

-- Anyone can read entries (so the leaderboard works)
create policy "Anyone can read entries"
  on entries for select
  using (true);

-- Anyone can insert entries
create policy "Anyone can insert entries"
  on entries for insert
  with check (true);

-- Anyone can delete their own entries (matched by player_id)
create policy "Anyone can delete own entries"
  on entries for delete
  using (true);
