# Launch Checklist (V1.1)

## 1) DB migrations (order)
1. Run `scripts/supabase-v1-schema.sql`
2. Run `scripts/supabase-messages-v1.sql`
3. Run `scripts/supabase-push-prod.sql`
4. Run `scripts/supabase-moderation-v1.sql`
5. Run `scripts/supabase-analytics-v1.sql`
6. Run `scripts/supabase-p2-hardening.sql`
7. Run `scripts/supabase-release-hardening.sql`
8. Run `scripts/supabase-sanity-check.sql` and ensure all checks are `OK`

## 2) Edge functions
1. Set secrets: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
2. Deploy: `supabase functions deploy new-message-push`

## 3) App config
1. Ensure `.env` has:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
2. `npm install`
3. `npm run typecheck`
4. `npx expo start -c`

## 4) Manual QA
1. Auth signin/signup/session persistence
2. Feed load/create/like/save/comment
3. Moderation: report/hide/block
4. Messages realtime + seen unread
5. Groups create/join/leave
6. Notifications toggle on/off
7. Push deep-link opens right conversation
8. Search users/groups/posts
9. Debug-tools DEV actions

## 5) Launch gate
- No runtime crash on cold start
- No broken routes
- No duplicated tab labels
- Typecheck clean
