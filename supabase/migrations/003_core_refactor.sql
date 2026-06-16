-- Rename summary → reason
alter table inbound_leads rename column summary to reason;

-- Replace old feedback column with typed feedback schema
alter table inbound_leads drop column if exists feedback;
drop index if exists idx_leads_feedback;

alter table inbound_leads
  add column if not exists feedback_type     text check (feedback_type in ('correct', 'incorrect', 'override')),
  add column if not exists feedback_override text check (feedback_override in ('ACT', 'WATCH', 'IGNORE')),
  add column if not exists feedback_at       timestamptz;

create index if not exists idx_leads_feedback_type on inbound_leads(feedback_type)
  where feedback_type is not null;
