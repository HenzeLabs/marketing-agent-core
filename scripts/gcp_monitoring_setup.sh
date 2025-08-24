#!/bin/bash
# GCP Monitoring & Alerting Setup for Marketing Agent Core
# Usage: bash scripts/gcp_monitoring_setup.sh

PROJECT=henzelabs-gpt
REGION=us-east1
SERVICE=marketing-agent-core




# 1. Create alert for 5xx errors in Cloud Run (≥5 in 5m)
gcloud alpha monitoring policies create --policy-from-file=scripts/cloud_run_5xx_alert_policy.yaml --project=$PROJECT

# 2. Scheduled Query alert: No Shopify orders in last 24h
bq query --nouse_legacy_sql --format=csv --project_id=$PROJECT \
  'SELECT COUNT(*) FROM `henzelabs-gpt.hotash_raw.shopify_orders` WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)'
# (Set up as a scheduled query in BigQuery UI, then add a GCP alert on the result)


# 3. Scheduled Query alert: No Clarity rows in last 24h
bq query --nouse_legacy_sql --format=csv --project_id=$PROJECT \
  'SELECT COUNT(*) FROM `henzelabs-gpt.labessentials_raw.clarity_pageviews` WHERE snapshot_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)'
# (Set up as a scheduled query in BigQuery UI, then add a GCP alert on the result)

# 4. Set GCP budget alerts at 50/80/100%
# (Manual step: Use GCP Console > Billing > Budgets & alerts)
# See https://cloud.google.com/billing/docs/how-to/budgets for automation options
