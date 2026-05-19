-- SETLY DJ Booking Platform - Initial Schema

create table bookings (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null,
  phone text,
  event_type text,
  date date,
  location text,
  hours integer,
  amount numeric,
  deposit_paid boolean default false,
  status text default 'pending',
  notes text,
  stripe_session_id text,
  created_at timestamptz default now()
);

create table availability (
  id uuid default gen_random_uuid() primary key,
  date date unique not null,
  is_available boolean default true
);

create table setlist_requests (
  id uuid default gen_random_uuid() primary key,
  email text,
  event_data jsonb,
  generated_setlist text,
  created_at timestamptz default now()
);

-- Indexes
create index bookings_date_idx on bookings(date);
create index bookings_email_idx on bookings(email);
create index bookings_status_idx on bookings(status);
create index availability_date_idx on availability(date);

-- RLS Policies
alter table bookings enable row level security;
alter table availability enable row level security;
alter table setlist_requests enable row level security;

-- Allow inserts from anon (public booking form)
create policy "Allow public inserts on bookings" on bookings
  for insert with check (true);

-- Allow reads on availability
create policy "Allow public reads on availability" on availability
  for select using (true);

-- Allow inserts on setlist_requests
create policy "Allow public inserts on setlist_requests" on setlist_requests
  for insert with check (true);
