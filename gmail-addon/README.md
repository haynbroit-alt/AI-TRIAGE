# Priorix — Gmail Add-on

## Déploiement (5 étapes)

### 1. Créer le projet Apps Script

Aller sur [script.google.com](https://script.google.com) → Nouveau projet → Nommer "Priorix".

### 2. Copier les fichiers

Copier le contenu de `Code.gs` dans l'éditeur Apps Script.
Remplacer le `appsscript.json` par le fichier fourni (activer "Afficher le fichier manifeste" dans les paramètres).

### 3. Configurer les variables

Apps Script → Paramètres du projet → Propriétés de script :

| Clé | Valeur |
|-----|--------|
| `PRIORIX_API_URL` | `https://your-deployment.vercel.app/api/triage` |
| `WEBHOOK_SECRET` | (même valeur que dans `.env`) |

### 4. Déployer en tant qu'Add-on

Extensions → Déploiements → Nouveau déploiement → Add-on Gmail → Déployer.

Pour tester sans publication : Extensions → Tester les déploiements → Installer dans Gmail.

### 5. (Optionnel) Via clasp

```bash
npm install -g @google/clasp
clasp login
clasp clone <SCRIPT_ID>   # ou clasp create --type sheets
clasp push
```

## Utilisation

Ouvrir un email dans Gmail → le panneau Priorix apparaît automatiquement à droite → décision ACT / WATCH / IGNORE affichée avec le score et la raison.

## Variables d'environnement backend

Le backend Next.js nécessite dans `.env.local` :

```
OPENAI_API_KEY=sk-proj-...
NEXT_PUBLIC_SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
WEBHOOK_SECRET=...
```
