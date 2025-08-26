#!/usr/bin/env bash
set -euo pipefail
API_BASE="${API_BASE:-https://marketing-agent-core-hg4t45fswq-uc.a.run.app}"
brands=("labessentials" "hotash")
metrics=("sessions" "revenue")
summaries=("wow" "mom" "qoq")

if ! command -v jq >/dev/null 2>&1; then
  echo "jq not found; please install jq."
  exit 1
fi

for s in "${summaries[@]}"; do
  for b in "${brands[@]}"; do
    for m in "${metrics[@]}"; do
      if [ "$s" = "wow" ]; then
        url="${API_BASE}/api/summary/${s}?brand=${b}&metric=${m}&window=7"
      else
        url="${API_BASE}/api/summary/${s}?brand=${b}&metric=${m}"
      fi
      echo "== $b $m $s =="
      code=$(curl -s -o /tmp/${s}_${b}_${m}.json -w "%{http_code}" "$url")
      echo "HTTP $code"
      [ "$code" = "200" ] || { echo "❌ $s endpoint failed for $b $m"; cat /tmp/${s}_${b}_${m}.json; exit 2; }
      jq -e 'has("brand") and has("current") and has("previous") and has("change") and has("percent_change")' /tmp/${s}_${b}_${m}.json >/dev/null || { echo "❌ Invalid JSON shape"; exit 3; }
      current=$(jq '.current' /tmp/${s}_${b}_${m}.json)
      change=$(jq '.change' /tmp/${s}_${b}_${m}.json)
      pct=$(jq '.percent_change' /tmp/${s}_${b}_${m}.json)
      echo "Current: $current | Change: $change | %Change: $pct%"
      echo
    done
  done
done

echo "✅ All summary endpoints smoke passed for both brands and metrics."