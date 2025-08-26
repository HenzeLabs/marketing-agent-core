#!/usr/bin/env bash
set -euo pipefail
API_BASE="${API_BASE:-https://marketing-agent-core-hg4t45fswq-uc.a.run.app}"
brands=("labessentials" "hotash")

# Ensure jq is present (CI has it; local machines may not)
if ! command -v jq >/dev/null 2>&1; then
  echo "jq not found; install jq to run this script."
  exit 1
fi

for b in "${brands[@]}"; do
  echo "== $b =="
  url="${API_BASE}/api/metrics/revenue?brand=${b}&source=shopify&range=last_30_days"
  code=$(curl -s -o /tmp/rev_${b}.json -w "%{http_code}" "$url")
  echo "HTTP $code $url"
  [ "$code" = "200" ] || { echo "❌ Revenue endpoint failed for $b"; cat /tmp/rev_${b}.json; exit 2; }
  jq -r '"Brand: " + .brand + ", Orders: " + (.orders|tostring) + ", Total: $" + (.total|tostring) + ", AOV: $" + (.aov|tostring)' /tmp/rev_${b}.json
  echo "✅ Revenue endpoint OK for $b"
done

echo "🎉 All revenue endpoints working"