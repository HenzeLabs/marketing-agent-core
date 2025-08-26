#!/usr/bin/env bash
set -euo pipefail
API_BASE="${API_BASE:-https://marketing-agent-core-hg4t45fswq-uc.a.run.app}"
brands=("labessentials" "hotash")

if ! command -v jq >/dev/null 2>&1; then
  echo "jq not found"; exit 1
fi

for b in "${brands[@]}"; do
  for path in \
    "/api/summary/wow?brand=${b}&metric=sessions&window=7" \
    "/api/summary/mom?brand=${b}&metric=sessions" \
    "/api/summary/wow?brand=${b}&metric=revenue&window=7" \
    "/api/summary/mom?brand=${b}&metric=revenue"
  do
    url="${API_BASE}${path}"
    echo "== $b $path =="
    code=$(curl -s -o /tmp/sum_${b}.json -w "%{http_code}" "$url")
    echo "HTTP $code"
    [ "$code" = "200" ] || { echo "❌ $url failed"; cat /tmp/sum_${b}.json; exit 2; }
    jq -e 'has("metric") and has("brand") and has("current") and has("previous") and has("window")' /tmp/sum_${b}.json >/dev/null || { echo "❌ invalid JSON"; exit 3; }
    jq -r '.window.type' /tmp/sum_${b}.json >/dev/null || { echo "❌ window missing"; exit 4; }
    echo "✅ $(jq -r '.window.type' /tmp/sum_${b}.json)"
  done
done
echo "✅ summaries smoke passed"