#!/usr/bin/env bash
set -euo pipefail

failures=()

check_route() {
  local label="$1"
  shift
  for p in "$@"; do
    if [[ -f "$p" ]]; then
      echo "[OK] $label -> $p"
      return
    fi
  done
  echo "[FAIL] $label route missing"
  failures+=("$label route missing")
}

echo "== Release Check (Unix) =="

if [[ ! -f ".env" ]]; then
  echo "[FAIL] .env missing"
  failures+=(".env missing")
else
  echo "[OK] .env present"
fi

SUPABASE_URL_VALUE="${EXPO_PUBLIC_SUPABASE_URL:-}"
if [[ -z "$SUPABASE_URL_VALUE" && -f ".env" ]]; then
  SUPABASE_URL_VALUE="$(grep -E '^\s*EXPO_PUBLIC_SUPABASE_URL\s*=' .env | head -n1 | cut -d'=' -f2- | xargs || true)"
fi
if [[ -z "$SUPABASE_URL_VALUE" ]]; then
  echo "[FAIL] EXPO_PUBLIC_SUPABASE_URL missing"
  failures+=("EXPO_PUBLIC_SUPABASE_URL missing")
else
  echo "[OK] EXPO_PUBLIC_SUPABASE_URL set"
fi

if [[ -f "package-lock.json" ]]; then
  npm ci >/dev/null
  echo "[OK] npm ci"
else
  npm install >/dev/null
  echo "[OK] npm install"
fi

if ! npm run preflight; then
  echo "[FAIL] preflight failed"
  failures+=("preflight failed")
else
  echo "[OK] preflight"
fi

check_route "home" "app/(tabs)/home.tsx" "app/(tabs)/home/index.tsx"
check_route "messages" "app/(tabs)/messages.tsx" "app/(tabs)/messages/index.tsx"
check_route "compose" "app/(tabs)/compose.tsx" "app/(tabs)/compose/index.tsx"
check_route "courses" "app/(tabs)/courses.tsx" "app/(tabs)/courses/index.tsx"
check_route "profile" "app/(tabs)/profile.tsx" "app/(tabs)/profile/index.tsx"

if [[ ${#failures[@]} -gt 0 ]]; then
  echo
  echo "Summary: FAIL"
  for f in "${failures[@]}"; do
    echo " - $f"
  done
  exit 1
fi

echo
echo "Summary: OK"
