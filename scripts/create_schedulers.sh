#!/bin/bash
# Create Cloud Scheduler jobs for both Lab Essentials and Hot Ash pipelines

# Lab Essentials - Run at 1 AM UTC daily
gcloud scheduler jobs create http labessentials-pipeline-daily \
  --location us-central1 \
  --schedule "0 1 * * *" \
  --http-method POST \
  --uri "https://us-central1-henzelabs-gpt.cloudfunctions.net/run-pipeline-entrypoint" \
  --headers "Content-Type=application/json" \
  --message-body '{"brand":"labessentials","source":"shopify"}' \
  --description "Daily Lab Essentials Shopify pipeline"

gcloud scheduler jobs create http labessentials-ga4-daily \
  --location us-central1 \
  --schedule "15 1 * * *" \
  --http-method POST \
  --uri "https://us-central1-henzelabs-gpt.cloudfunctions.net/run-pipeline-entrypoint" \
  --headers "Content-Type=application/json" \
  --message-body '{"brand":"labessentials","source":"ga4"}' \
  --description "Daily Lab Essentials GA4 pipeline"

gcloud scheduler jobs create http labessentials-customers-daily \
  --location us-central1 \
  --schedule "30 1 * * *" \
  --http-method POST \
  --uri "https://us-central1-henzelabs-gpt.cloudfunctions.net/run-pipeline-entrypoint" \
  --headers "Content-Type=application/json" \
  --message-body '{"brand":"labessentials","source":"shopify_customers"}' \
  --description "Daily Lab Essentials Shopify Customers pipeline"

# Hot Ash - Run at 1:45 AM UTC daily
gcloud scheduler jobs create http hotash-pipeline-daily \
  --location us-central1 \
  --schedule "45 1 * * *" \
  --http-method POST \
  --uri "https://us-central1-henzelabs-gpt.cloudfunctions.net/run-pipeline-entrypoint" \
  --headers "Content-Type=application/json" \
  --message-body '{"brand":"hotash","source":"shopify"}' \
  --description "Daily Hot Ash Shopify pipeline"

gcloud scheduler jobs create http hotash-ga4-daily \
  --location us-central1 \
  --schedule "0 2 * * *" \
  --http-method POST \
  --uri "https://us-central1-henzelabs-gpt.cloudfunctions.net/run-pipeline-entrypoint" \
  --headers "Content-Type=application/json" \
  --message-body '{"brand":"hotash","source":"ga4"}' \
  --description "Daily Hot Ash GA4 pipeline"

gcloud scheduler jobs create http hotash-customers-daily \
  --location us-central1 \
  --schedule "15 2 * * *" \
  --http-method POST \
  --uri "https://us-central1-henzelabs-gpt.cloudfunctions.net/run-pipeline-entrypoint" \
  --headers "Content-Type=application/json" \
  --message-body '{"brand":"hotash","source":"shopify_customers"}' \
  --description "Daily Hot Ash Shopify Customers pipeline"

echo "Scheduler jobs created. To list them:"
echo "gcloud scheduler jobs list --location us-central1"