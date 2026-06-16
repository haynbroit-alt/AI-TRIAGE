-- Feedback humain sur les décisions Priorix

alter table inbound_leads
  add column if not exists feedback  text check (feedback in ('ACT', 'WATCH', 'IGNORE')),
  add column if not exists feedback_at timestamptz;

create index if not exists idx_leads_feedback on inbound_leads(feedback)
  where feedback is not null;
