#!/usr/bin/env bash
set -euo pipefail
API_BASE="${API_BASE:-https://marketing-agent-core-hg4t45fswq-uc.a.run.app}"
brands=("labessentials" "hotash")
metrics=("sessions" "revenue")

if ! command -v jq >/dev/null 2>&1; then
  echo "jq not found; please install jq."
  exit 1
fi

for b in "${brands[@]}"; do
  for m in "${metrics[@]}"; do
    url="${API_BASE}/api/summary/wow?brand=${b}&metric=${m}&window=7"
    echo "== $b $m WoW =="
    code=$(curl -s -o /tmp/wow_${b}_${m}.json -w "%{http_code}" "$url")
    echo "HTTP $code $url"
    [ "$code" = "200" ] || { echo "❌ WoW endpoint failed for $b $m"; cat /tmp/wow_${b}_${m}.json; exit 2; }
    # Validate JSON shape
    jq -e 'has("brand") and has("current") and has("previous") and has("change") and has("percent_change")' /tmp/wow_${b}_${m}.json >/dev/null || { echo "❌ Invalid JSON shape for $b $m"; exit 3; }
    current=$(jq '.current' /tmp/wow_${b}_${m}.json)
    change=$(jq '.change' /tmp/wow_${b}_${m}.json)
    pct=$(jq '.percent_change' /tmp/wow_${b}_${m}.json)
    echo "Current: $current | Change: $change | %Change: $pct%"
    echo
  done
done

echo "✅ WoW summary smoke passed for both brands and metrics."