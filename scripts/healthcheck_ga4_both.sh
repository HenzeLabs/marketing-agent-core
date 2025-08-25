#!/usr/bin/env bash
set -euo pipefail
PROJECT=henzelabs-gpt
BRANDS=("labessentials_raw" "hotash_raw")
TABLE="ga4_daily_metrics"

fail=0
for DS in "${BRANDS[@]}"; do
  echo "== Checking ${DS}.${TABLE} (rows in last 2 days) =="
  bq query --use_legacy_sql=false --format=json "
  WITH W AS (SELECT DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY) d)
  SELECT COUNT(*) AS row_count
  FROM \`${PROJECT}.${DS}.${TABLE}\`, W
  WHERE date >= W.d" > /tmp/hc_${DS}.json || { echo "BQ query failed for $DS"; fail=1; continue; }

  python3 - <<PY || { echo "Parse failed for $DS"; fail=1; }
import json, sys
data=json.load(open("/tmp/hc_${DS}.json"))
# BigQuery JSON format
row_count=int(data[0]["row_count"])
print(f"${DS}_rows_last2={row_count}")
sys.exit(0 if row_count>0 else 2)
PY
  rc=$?
  if [ $rc -ne 0 ]; then
    echo "❌ Freshness FAILED for ${DS} (no rows in last 2 days)"
    fail=1
  else
    echo "✅ Freshness OK for ${DS}"
  fi
done

exit $fail