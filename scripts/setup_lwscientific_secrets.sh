#!/bin/bash

# Setup LW Scientific secrets in Google Secret Manager
PROJECT_ID="henzelabs-gpt"

echo "Creating LW Scientific secrets..."

# Basic config secrets
gcloud secrets create lwscientific_gcp_project_id --data-file=<(echo -n "henzelabs-gpt") --project=$PROJECT_ID
gcloud secrets create lwscientific_bigquery_dataset --data-file=<(echo -n "lwscientific_raw") --project=$PROJECT_ID
gcloud secrets create lwscientific_shopify_shop_name --data-file=<(echo -n "lwscientific") --project=$PROJECT_ID

# Shopify API tokens (you'll need to provide these)
echo "Enter your LW Scientific Shopify Admin API token:"
read -s ADMIN_TOKEN
gcloud secrets create lwscientific_prod_shopify_admin_api_token --data-file=<(echo -n "$ADMIN_TOKEN") --project=$PROJECT_ID

echo "Enter your LW Scientific Shopify Reporting API token:"
read -s REPORTING_TOKEN
gcloud secrets create lwscientific_prod_shopify_reporting_api_token --data-file=<(echo -n "$REPORTING_TOKEN") --project=$PROJECT_ID

# GA4 property ID
echo "Enter your LW Scientific GA4 property ID:"
read GA4_PROPERTY_ID
gcloud secrets create lwscientific_ga4_property_id --data-file=<(echo -n "$GA4_PROPERTY_ID") --project=$PROJECT_ID

# GA4 service account JSON (file path)
echo "Enter path to your LW Scientific GA4 service account JSON file:"
read GA4_JSON_PATH
gcloud secrets create lwscientific_ga4_service_account_json --data-file="$GA4_JSON_PATH" --project=$PROJECT_ID

# Clarity API key
echo "Enter your LW Scientific Clarity API key:"
read -s CLARITY_KEY
gcloud secrets create lwscientific_prod_clarity_api_key --data-file=<(echo -n "$CLARITY_KEY") --project=$PROJECT_ID

echo "All LW Scientific secrets created successfully!"