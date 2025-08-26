#!/usr/bin/env bash
set -euo pipefail
PROJECT=henzelabs-gpt
REGION=us-central1
AN_DS=analytics_319024536
RAW_DS=hotash_raw
TABLE=ga4_daily_metrics
bq --location=US mk --transfer_config --data_source=schedule \
  --display_name="${RAW_DS}-ga4-daily-merge" \
  --target_dataset="${PROJECT}:${RAW_DS}" \
  --schedule="every 24 hours" \
  --params='{
    "query": "DECLARE d0 STRING DEFAULT FORMAT_DATE(''%Y%m%d'', DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY));\n              DECLARE d1 STRING DEFAULT FORMAT_DATE(''%Y%m%d'', CURRENT_DATE());\n              MERGE `'$PROJECT'.'$RAW_DS'.'$TABLE'` T\n              USING (\n                SELECT PARSE_DATE(''%Y%m%d'', event_date) AS date,\n                       COUNTIF(event_name=''session_start'') AS sessions,\n                       CAST(NULL AS INT64) AS total_users,\n                       CAST(NULL AS INT64) AS new_users,\n                       CAST(NULL AS INT64) AS engaged_sessions,\n                       CAST(NULL AS FLOAT64) AS avg_session_duration_seconds,\n                       CAST(NULL AS FLOAT64) AS bounce_rate\n                FROM `'$PROJECT'.'$AN_DS'.events_*`\n                WHERE _TABLE_SUFFIX BETWEEN d0 AND d1\n                  AND event_name=''session_start''\n                GROUP BY 1\n              ) S\n              ON T.date=S.date\n              WHEN MATCHED THEN UPDATE SET sessions=S.sessions\n              WHEN NOT MATCHED THEN INSERT ROW;",
    "destination_table_name_template": "noop",
    "write_disposition": "WRITE_TRUNCATE"
  }' 2>/dev/null || true
