create table public.matunga_rooms (
  id uuid not null default gen_random_uuid() primary key,
  code text not null unique,
  board jsonb not null,
  turn text not null default 'white',
  winner text,
  player_white text,
  player_black text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

alter table public.matunga_rooms enable row level security;

create policy "anyone can read rooms"
on public.matunga_rooms for select
using (true);

create policy "anyone can create rooms"
on public.matunga_rooms for insert
with check (true);

create policy "anyone can update rooms"
on public.matunga_rooms for update
using (true)
with check (true);

alter publication supabase_realtime add table public.matunga_rooms;
alter table public.matunga_rooms replica identity full;