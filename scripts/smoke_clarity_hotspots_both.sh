#!/usr/bin/env bash
set -euo pipefail
API_BASE="${API_BASE:-https://marketing-agent-core-hg4t45fswq-uc.a.run.app}"
brands=("labessentials" "hotash")

if ! command -v jq >/dev/null 2>&1; then
  echo "jq not found; please install jq."
  exit 1
fi

for b in "${brands[@]}"; do
  url="${API_BASE}/api/clarity/hotspots?brand=${b}&source=clarity&range=last_7_days"
  echo "== $b =="
  code=$(curl -s -o /tmp/clar_${b}.json -w "%{http_code}" "$url")
  echo "HTTP $code $url"
  [ "$code" = "200" ] || { echo "❌ Hotspots endpoint failed for $b"; cat /tmp/clar_${b}.json; exit 2; }
  # Validate JSON shape
  jq -e 'has("items") and has("summary")' /tmp/clar_${b}.json >/dev/null || { echo "❌ Invalid JSON shape for $b"; exit 3; }
  count=$(jq '.items | length' /tmp/clar_${b}.json)
  echo "items: $count | summary: $(jq -r .summary /tmp/clar_${b}.json)"
  echo
done

echo "✅ Clarity hotspots smoke passed for both brands."