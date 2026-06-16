-- AI Triage Inbox — initial schema

create extension if not exists "uuid-ossp";

create table if not exists inbound_leads (
  id           uuid primary key default uuid_generate_v4(),
  sender       text not null,
  subject      text not null,
  summary      text,
  business     numeric(4,1) not null,
  urgency      numeric(4,1) not null,
  fit          numeric(4,1) not null,
  score        numeric(5,2) not null,
  decision     text not null check (decision in ('ACT', 'WATCH', 'IGNORE')),
  raw_email    jsonb not null,
  created_at   timestamptz default now(),
  processed_at timestamptz
);

create index if not exists idx_leads_decision   on inbound_leads(decision);
create index if not exists idx_leads_created_at on inbound_leads(created_at desc);
create index if not exists idx_leads_score      on inbound_leads(score desc);
