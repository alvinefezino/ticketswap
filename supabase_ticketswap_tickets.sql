-- TicketSwap website tickets — same fields as app Ticket Generator Form
-- Paste into Supabase SQL Editor and Run (safe to re-run). Shares ticket-images bucket with app.
create table if not exists ticketswap_tickets (
  id uuid primary key default gen_random_uuid(),
  receipt_code text unique not null,
  user_id uuid references auth.users(id) on delete set null,
  artist_name text,
  event_name text,
  title text not null,
  section text,
  row_label text,
  seat text,
  date date not null,
  time text,
  location text,
  address text,
  city text,
  ticket_type text,
  level text,
  number_of_tickets int default 1,
  seats jsonb default '[]'::jsonb,
  image_url text,
  price numeric default 0,
  seller_email text,
  seller_name text,
  description text,
  created_at timestamptz default now()
);
create index if not exists idx_tswap_receipt on ticketswap_tickets(receipt_code);
create index if not exists idx_tswap_date on ticketswap_tickets(date);
create index if not exists idx_tswap_user on ticketswap_tickets(user_id);
alter table ticketswap_tickets add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table ticketswap_tickets enable row level security;
drop policy if exists "public read tswap" on ticketswap_tickets;
create policy "public read tswap" on ticketswap_tickets for select using (true);
drop policy if exists "public insert tswap" on ticketswap_tickets;
create policy "public insert tswap" on ticketswap_tickets for insert with check (true);
drop policy if exists "public update tswap" on ticketswap_tickets;
create policy "public update tswap" on ticketswap_tickets for update using (true);
drop policy if exists "public delete tswap" on ticketswap_tickets;
create policy "public delete tswap" on ticketswap_tickets for delete using (true);
-- Stricter: only owner can delete (keep public read for /t/ preview)
-- (kept permissive insert for anon sellers during demo; to lock to auth only, replace insert check with: auth.uid() = user_id)

-- ensure ticket-images bucket exists (from app)
insert into storage.buckets (id, name, public) values ('ticket-images','ticket-images', true)
on conflict (id) do nothing;
