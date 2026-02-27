# RUNBOOK Production - BLOC v1.0.0

Date cible lancement: **13 mars**

## 1) Pre-requis
- Acces Owner/Admin au projet Supabase production
- Supabase CLI installe (`supabase --version`)
- Node.js LTS + npm
- Acces au repo `main` propre (pas de changements locaux non commits)

## 2) Variables requises
### App (.env - non committe)
- `EXPO_PUBLIC_SUPABASE_URL`
- `EXPO_PUBLIC_SUPABASE_ANON_KEY`

### Edge secrets (Supabase Functions)
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

## 3) SQL migration order (obligatoire)
Executer dans Supabase SQL Editor, dans cet ordre exact:
1. `scripts/supabase-messages-v1.sql`
2. `scripts/supabase-push-prod.sql`
3. `scripts/supabase-moderation-v1.sql`
4. `scripts/supabase-analytics-v1.sql`
5. `scripts/supabase-p2-hardening.sql`
6. `scripts/supabase-release-hardening.sql`

Verification apres migration:
- Executer `scripts/supabase-sanity-check.sql`
- Tous les checks doivent etre `OK`

## 4) Deploy edge function
```bash
supabase functions deploy new-message-push
```

Verifier les secrets:
```bash
supabase secrets list
```

Verifier les logs:
```bash
supabase functions logs new-message-push --since 1h
```

## 5) Build + preflight
```bash
npm ci
npm run preflight
```

Checks rapides release:
- Windows: `powershell -ExecutionPolicy Bypass -File scripts/release-check.ps1`
- Mac/Linux: `bash scripts/release-check.sh`

## 6) Smoke test (5 minutes)
1. Auth: sign in, kill app, relaunch -> session persiste
2. Feed: create post, like/save/comment, pull-to-refresh
3. Messages: DM realtime entre 2 comptes, unread/seen se met a jour
4. Groupes: create/join/leave + message groupe
5. Push: DM recu, tap notification ouvre la bonne conversation
6. Moderation: block user -> posts masques du feed
7. Search: recherche user/groupe/post retourne des resultats

## 7) GO / NO-GO
### GO si:
- `preflight` vert
- `sanity-check.sql` tout `OK`
- 0 crash cold start
- push deep link valide Android + iOS
- smoke test complet passe

### NO-GO si:
- route cassée, crash runtime, ou push ouvre mauvais ecran
- RLS/index critiques en `KO`

## 8) Rollback / mitigation
### Edge rollback rapide
- redeployer version precedente `new-message-push`
- ou kill switch global:
```sql
update public.app_config
set value = 'true', updated_at = now()
where key = 'push_global_disabled';
```

### Analytics kill switch
```sql
update public.app_config
set value = 'true', updated_at = now()
where key = 'analytics_global_disabled';
```

### SQL rollback
- Pas de rollback destructif recommande en prod sur V1
- Mitigation: desactiver via `app_config` + corriger via migration additive
- Si migration non compatible: stop deploy client, patch SQL, rerun sanity-check

## 9) Deep links push (validation)
- Scheme attendu: `bloc://`
- Payload push contient `data.url` (`/messages/{id}` ou `/messages/group/{id}`)
- Test Android + iOS:
  - App ouverte, background, et fermee (cold start)
  - tap push doit router vers la conversation cible

## 10) Tag release
```bash
git checkout main
git pull
git tag v1.0.0
git push origin v1.0.0
```
