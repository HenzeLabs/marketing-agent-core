#!/usr/bin/env bash
set -euo pipefail

PROJECT=henzelabs-gpt
RAW_DS=hotash_raw
# rows in metrics last 2 days
bq query --use_legacy_sql=false --format=json "
WITH W AS (SELECT DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY) d)
SELECT COUNT(*) rows
FROM \`${PROJECT}.${RAW_DS}.ga4_daily_metrics\`, W
WHERE date >= W.d" | python - <<'PY'
import json,sys
rows=json.load(sys.stdin)[0]["rows"][0]["f"][0]["v"]
print(f"ga4_daily_metrics_rows_last2={rows}")
exit(0 if int(rows)>0 else 1)
PY
source /Users/laurenadmin/Projects/marketing-agent-core/.venv/bin/activate

python3 scripts/healthcheck_ga4_hotash.py