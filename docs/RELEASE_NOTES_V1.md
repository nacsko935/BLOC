# Release Notes V1

## Public (court)
- Nouvelle messagerie en temps reel (DM + groupes)
- Fil d'actualite connecte (publication, likes, commentaires, sauvegarde)
- Recherche simplifiee (utilisateurs, groupes, posts)
- Profil et parametres renforces
- Amelioration de la stabilite generale et performances

## Interne (detail)
### Produit
- Navigation tabs stabilisee (5 onglets, labels explicites)
- Ecrans messages detail sortis des tabs pour eviter onglets dupliques
- Etats vides actionnables + skeleton loaders feed/messages

### Backend Supabase
- Tables/messages/realtime branchees
- Push tokens + edge function `new-message-push`
- Moderation tables: `reports`, `blocks`, `hidden_posts`
- Analytics table: `analytics_events`
- Kill switches globaux via `app_config`

### Securite/RLS
- RLS active sur tables sensibles
- Politiques owner-based sur push/moderation/analytics

### Exploitation
- Runbook prod: `docs/RUNBOOK_PROD.md`
- Sanity SQL: `scripts/supabase-sanity-check.sql`
- Checks locaux: `scripts/release-check.ps1`, `scripts/release-check.sh`
