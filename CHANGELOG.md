# Changelog

## v1.0.0 - 2026-02-26

### Added
- Auth + Profiles + Feed Supabase (create/like/save/comment)
- Messages realtime + seen + groupes create/join/leave
- Push notifications (token registration + edge function + deep links)
- Moderation baseline (report/block/hide)
- Search (users/groupes/posts)
- Analytics events + throttling
- Debug tools (DEV only)

### Hardened
- TabBar stable (single Messages tab, explicit labels)
- Global auth bootstrap loader + error boundary
- SQL hardening indexes + RLS policies
- Release scripts + runbook + sanity SQL checks

### Notes
- Launch runbook: `docs/RUNBOOK_PROD.md`
- Release notes detail: `docs/RELEASE_NOTES_V1.md`
