$ErrorActionPreference = "Stop"

$failures = New-Object System.Collections.Generic.List[string]

function Test-RouteFile {
  param(
    [string]$Label,
    [string[]]$Candidates
  )
  foreach ($path in $Candidates) {
    if (Test-Path $path) {
      Write-Host "[OK] $Label -> $path"
      return
    }
  }
  $failures.Add("$Label route missing")
  Write-Host "[FAIL] $Label route missing"
}

Write-Host "== Release Check (Windows) =="

if (-not (Test-Path ".env")) {
  $failures.Add(".env missing")
  Write-Host "[FAIL] .env missing"
} else {
  Write-Host "[OK] .env present"
}

$envValue = $env:EXPO_PUBLIC_SUPABASE_URL
if ([string]::IsNullOrWhiteSpace($envValue) -and (Test-Path ".env")) {
  $line = Select-String -Path ".env" -Pattern "^\s*EXPO_PUBLIC_SUPABASE_URL\s*=\s*(.+)\s*$" -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($line) { $envValue = $line.Matches[0].Groups[1].Value }
}
if ([string]::IsNullOrWhiteSpace($envValue)) {
  $failures.Add("EXPO_PUBLIC_SUPABASE_URL missing")
  Write-Host "[FAIL] EXPO_PUBLIC_SUPABASE_URL missing"
} else {
  Write-Host "[OK] EXPO_PUBLIC_SUPABASE_URL set"
}

if (Test-Path "package-lock.json") {
  npm ci | Out-Null
  Write-Host "[OK] npm ci"
} else {
  npm install | Out-Null
  Write-Host "[OK] npm install"
}

if ($LASTEXITCODE -ne 0) {
  $failures.Add("npm install step failed")
}

npm run preflight
if ($LASTEXITCODE -ne 0) {
  $failures.Add("preflight failed")
  Write-Host "[FAIL] preflight failed"
} else {
  Write-Host "[OK] preflight"
}

Test-RouteFile -Label "home" -Candidates @("app/(tabs)/home.tsx", "app/(tabs)/home/index.tsx")
Test-RouteFile -Label "messages" -Candidates @("app/(tabs)/messages.tsx", "app/(tabs)/messages/index.tsx")
Test-RouteFile -Label "compose" -Candidates @("app/(tabs)/compose.tsx", "app/(tabs)/compose/index.tsx")
Test-RouteFile -Label "courses" -Candidates @("app/(tabs)/courses.tsx", "app/(tabs)/courses/index.tsx")
Test-RouteFile -Label "profile" -Candidates @("app/(tabs)/profile.tsx", "app/(tabs)/profile/index.tsx")

if ($failures.Count -gt 0) {
  Write-Host ""
  Write-Host "Summary: FAIL"
  $failures | ForEach-Object { Write-Host " - $_" }
  exit 1
}

Write-Host ""
Write-Host "Summary: OK"
exit 0
