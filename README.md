# AI Triage Inbox — B2B Inbound Lead Triage

Minimal pipeline: Email → LLM features → Score → ACT / WATCH / IGNORE.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Anthropic** — feature extraction (business / urgency / fit)
- **Supabase** — persistence
- **Slack** — optional sales alerts on ACT decisions

## Quick start

```bash
cp .env.example .env.local
# fill in ANTHROPIC_API_KEY + Supabase vars
npm install
npm run dev
```

Dashboard: http://localhost:3000/dashboard

## Webhook

```
POST /api/triage
x-webhook-secret: <WEBHOOK_SECRET>

{
  "from": "alice@acme.com",
  "subject": "Demande de démo",
  "body": "Bonjour, nous cherchons..."
}
```

Response:

```json
{
  "features": { "business": 8, "urgency": 7, "fit": 9, "summary": "..." },
  "score": 8.0,
  "decision": "ACT",
  "logged_at": "2026-06-16T..."
}
```

## Scoring

| Variable | Poids |
|----------|-------|
| business | 1/3   |
| urgency  | 1/3   |
| fit      | 1/3   |

Seuils : **≥ 8 → ACT** · **≥ 5 → WATCH** · **< 5 → IGNORE**

## Database

Run `supabase/migrations/001_init.sql` in your Supabase SQL editor.
