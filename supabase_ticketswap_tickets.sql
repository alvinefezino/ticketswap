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
  currency text default 'EUR',
  seller_email text,
  seller_name text,
  buyer_full_name text,
  buyer_email text,
  beneficiary_name text,
  account_number text,
  sort_code text,
  bic_swift text,
  bank_name text,
  bank_account_holder text,
  bank_iban text,
  payment_status text default 'pending',
  receipt_url text,
  receipt_type text,
  receipt_uploaded_at timestamptz,
  receipt_email text,
  description text,
  created_at timestamptz default now()
);
create index if not exists idx_tswap_receipt on ticketswap_tickets(receipt_code);
create index if not exists idx_tswap_date on ticketswap_tickets(date);
create index if not exists idx_tswap_user on ticketswap_tickets(user_id);
alter table ticketswap_tickets add column if not exists user_id uuid references auth.users(id) on delete set null;
alter table ticketswap_tickets add column if not exists beneficiary_name text;
alter table ticketswap_tickets add column if not exists account_number text;
alter table ticketswap_tickets add column if not exists sort_code text;
alter table ticketswap_tickets add column if not exists bic_swift text;
alter table ticketswap_tickets add column if not exists bank_name text;
alter table ticketswap_tickets add column if not exists bank_account_holder text;
alter table ticketswap_tickets add column if not exists bank_iban text;
alter table ticketswap_tickets add column if not exists payment_status text default 'pending';
alter table ticketswap_tickets add column if not exists receipt_url text;
alter table ticketswap_tickets add column if not exists receipt_type text;
alter table ticketswap_tickets add column if not exists receipt_uploaded_at timestamptz;
alter table ticketswap_tickets add column if not exists receipt_email text;
-- backfill old rows: null status -> pending
update ticketswap_tickets set payment_status = 'pending' where payment_status is null;
alter table ticketswap_tickets enable row level security;
drop policy if exists "public read tswap" on ticketswap_tickets;
create policy "public read tswap" on ticketswap_tickets for select using (true);
drop policy if exists "public insert tswap" on ticketswap_tickets;
create policy "public insert tswap" on ticketswap_tickets for insert with check (true);
drop policy if exists "public update tswap" on ticketswap_tickets;
create policy "public update tswap" on ticketswap_tickets for update using (true);
drop policy if exists "public delete tswap" on ticketswap_tickets;
create policy "public delete tswap" on ticketswap_tickets for delete using (true);

-- ensure buckets exist
insert into storage.buckets (id, name, public) values ('ticket-images','ticket-images', true)
on conflict (id) do nothing;
insert into storage.buckets (id, name, public) values ('ticket-receipts','ticket-receipts', true)
on conflict (id) do nothing;

-- allow public read/write for receipt bucket via storage policies (simple permissive for demo)
drop policy if exists "public read receipts" on storage.objects;
create policy "public read receipts" on storage.objects for select using (bucket_id = 'ticket-receipts');
drop policy if exists "public insert receipts" on storage.objects;
create policy "public insert receipts" on storage.objects for insert with check (bucket_id = 'ticket-receipts');
drop policy if exists "public update receipts" on storage.objects;
create policy "public update receipts" on storage.objects for update using (bucket_id = 'ticket-receipts');
drop policy if exists "public delete receipts" on storage.objects;
create policy "public delete receipts" on storage.objects for delete using (bucket_id = 'ticket-receipts');

-- Payment methods extra (Apple Pay, Venmo, Zelle, Cash App) - location-based currency uses city/location fields
alter table if exists public.ticketswap_tickets add column if not exists apple_pay_details text;
alter table if exists public.ticketswap_tickets add column if not exists venmo_handle text;
alter table if exists public.ticketswap_tickets add column if not exists zelle_details text;
alter table if exists public.ticketswap_tickets add column if not exists cashapp_cashtag text;
alter table if exists public.ticketswap_tickets add column if not exists buyer_full_name text;
alter table if exists public.ticketswap_tickets add column if not exists buyer_email text;
-- Seller-chosen currency (AUD / EUR / GBP)
alter table ticketswap_tickets add column if not exists currency text default 'EUR';
alter table if exists public.ticketswap_tickets add column if not exists currency text default 'EUR';

