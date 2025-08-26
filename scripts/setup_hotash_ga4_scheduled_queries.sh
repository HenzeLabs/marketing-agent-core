#!/bin/bash

# Hot Ash GA4 Scheduled Queries Setup
# Creates/Updates scheduled queries for GA4 data ingestion in US multi-region

set -e

# Configuration
PROJECT=henzelabs-gpt
RAW_DS=hotash_raw
TABLE=ga4_daily_metrics
ANALYTICS_DS=analytics_319024536

echo "Setting up Hot Ash GA4 scheduled queries..."
echo "Project: $PROJECT"
echo "Raw Dataset: $RAW_DS"
echo "Analytics Dataset: $ANALYTICS_DS"

# Set project
gcloud config set project "$PROJECT"

# Enable required APIs
echo "Enabling BigQuery Data Transfer API..."
gcloud services enable bigquerydatatransfer.googleapis.com

# Create target table if it doesn't exist
echo "Creating target table if not exists..."
bq query --use_legacy_sql=false "
CREATE TABLE IF NOT EXISTS \`${PROJECT}.${RAW_DS}.${TABLE}\`(
  date DATE NOT NULL,
  sessions INT64,
  total_users INT64,
  new_users INT64,
  engaged_sessions INT64,
  avg_session_duration_seconds FLOAT64,
  bounce_rate FLOAT64
) PARTITION BY date"

echo "== Creating/Updating HOURLY intraday scheduled query =="
bq --location=US mk --transfer_config \
  --data_source=scheduled_query \
  --display_name="hotash_ga4_intraday_hourly" \
  --target_dataset="${PROJECT}:${RAW_DS}" \
  --schedule="every 1 hours" \
  --service_account_name="henze-gpt-agent@henzelabs-gpt.iam.gserviceaccount.com" \
  --params='{
    "query": "DECLARE y STRING DEFAULT FORMAT_DATE('"'"'%Y%m%d'"'"', CURRENT_DATE()); MERGE `'"${PROJECT}"'.'"${RAW_DS}"'.'"${TABLE}"'` T USING ( SELECT PARSE_DATE('"'"'%Y%m%d'"'"', event_date) AS date, COUNTIF(event_name='"'"'session_start'"'"') AS sessions, CAST(NULL AS INT64) AS total_users, CAST(NULL AS INT64) AS new_users, CAST(NULL AS INT64) AS engaged_sessions, CAST(NULL AS FLOAT64) AS avg_session_duration_seconds, CAST(NULL AS FLOAT64) AS bounce_rate FROM `'"${PROJECT}"'.'"${ANALYTICS_DS}"'.events_intraday_*` WHERE _TABLE_SUFFIX = y AND event_name='"'"'session_start'"'"' GROUP BY 1 ) S ON T.date=S.date WHEN MATCHED THEN UPDATE SET sessions=S.sessions WHEN NOT MATCHED THEN INSERT ROW;",
    "destination_table_name_template": "noop",
    "write_disposition": "WRITE_TRUNCATE"
  }'

echo "== Creating/Updating DAILY final scheduled query =="
bq --location=US mk --transfer_config \
  --data_source=scheduled_query \
  --display_name="hotash_ga4_daily_merge" \
  --target_dataset="${PROJECT}:${RAW_DS}" \
  --schedule="every 24 hours" \
  --service_account_name="henze-gpt-agent@henzelabs-gpt.iam.gserviceaccount.com" \
  --params='{
    "query": "DECLARE d0 STRING DEFAULT FORMAT_DATE('"'"'%Y%m%d'"'"', DATE_SUB(CURRENT_DATE(), INTERVAL 3 DAY)); DECLARE d1 STRING DEFAULT FORMAT_DATE('"'"'%Y%m%d'"'"', CURRENT_DATE()); MERGE `'"${PROJECT}"'.'"${RAW_DS}"'.'"${TABLE}"'` T USING ( SELECT PARSE_DATE('"'"'%Y%m%d'"'"', event_date) AS date, COUNTIF(event_name='"'"'session_start'"'"') AS sessions, CAST(NULL AS INT64) AS total_users, CAST(NULL AS INT64) AS new_users, CAST(NULL AS INT64) AS engaged_sessions, CAST(NULL AS FLOAT64) AS avg_session_duration_seconds, CAST(NULL AS FLOAT64) AS bounce_rate FROM `'"${PROJECT}"'.'"${ANALYTICS_DS}"'.events_*` WHERE _TABLE_SUFFIX BETWEEN d0 AND d1 AND event_name='"'"'session_start'"'"' GROUP BY 1 ) S ON T.date=S.date WHEN MATCHED THEN UPDATE SET sessions=S.sessions WHEN NOT MATCHED THEN INSERT ROW;",
    "destination_table_name_template": "noop",
    "write_disposition": "WRITE_TRUNCATE"
  }'

echo "== Listing transfer configs in US region =="
bq ls --transfer_config --transfer_location=US

echo "Hot Ash GA4 scheduled queries setup complete!"