#!/bin/bash
# Deploy the Shopify Customers pipeline as a Google Cloud Function
# Usage: bash deploy_cloud_function.sh <GCP_PROJECT_ID> <REGION>

set -e

PROJECT_ID=${1:-your-gcp-project-id}
REGION=${2:-us-central1}
FUNCTION_NAME=shopify_customers_entrypoint
ENTRY_POINT=shopify_customers_entrypoint
RUNTIME=python311

# Deploy the function
gcloud functions deploy $FUNCTION_NAME \
  --project $PROJECT_ID \
  --region $REGION \
  --runtime $RUNTIME \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point $ENTRY_POINT \
  --source .

echo "\nDeployed $FUNCTION_NAME to project $PROJECT_ID in region $REGION."
echo "You can now schedule it with Cloud Scheduler as described in cloud_scheduler_setup.md."
