# Priorix

> Vous savez immédiatement quels emails méritent votre attention.

Priorix est un moteur de triage intelligent pour les emails entrants.

Une entrée. Trois signaux. Une décision.

## Comment ça marche

```
Email entrant
      ↓
    LLM
      ↓
Business / Urgency / Fit  (0–10 chacun)
      ↓
    Score  (moyenne)
      ↓
ACT / WATCH / IGNORE
      ↓
Alerte ou action
```

| Décision | Signification |
|----------|---------------|
| **ACT**  | Répondre immédiatement |
| **WATCH**| Traiter plus tard |
| **IGNORE**| Archiver ou ignorer |

Chaque décision est accompagnée d'une explication courte et compréhensible.

## Stack

- **Next.js 15** (App Router, TypeScript)
- **Anthropic** — extraction des signaux (Business / Urgency / Fit)
- **Supabase** — persistance
- **Slack** — alertes sur décisions ACT (optionnel)

## Démarrage

```bash
cp .env.example .env.local
# Remplir ANTHROPIC_API_KEY + variables Supabase
npm install
npm run dev
```

Dashboard : http://localhost:3000/dashboard

## Base de données

Exécuter `supabase/migrations/001_init.sql` dans l'éditeur SQL Supabase.

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

Réponse :

```json
{
  "features": { "business": 8, "urgency": 7, "fit": 9, "summary": "PME cherche automatisation avec budget identifié." },
  "score": 8.0,
  "decision": "ACT",
  "logged_at": "2026-06-16T..."
}
```

## Test rapide

```bash
npx tsx scripts/test-triage.ts
```

## Philosophie

Priorix ne remplace pas l'humain. Priorix réduit le bruit.

Pas de multi-agents. Pas de raisonnement complexe. Pas d'autonomie artificielle.
