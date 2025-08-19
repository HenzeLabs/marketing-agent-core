# Marketing Agent Core - Project Overview

## What This Project Does

- Runs a marketing data pipeline for Shopify customers and orders.
- Deploys as a secure, serverless HTTP API on Google Cloud Run.
- Supports both HTTP (Cloud Run) and CLI triggers.
- Logs every pipeline run (success or error) to BigQuery for auditing.
- Can be scheduled with Google Cloud Scheduler for automation.

## Key Google Cloud Components

- **Cloud Run**: Hosts the Flask API, scalable and secure.
- **BigQuery**: Stores pipeline logs in `henzelabs-gpt.analytics.pipeline_logs`.
- **Cloud Scheduler**: Triggers pipelines on a schedule via HTTP.
- **IAM**: Only authorized users/service accounts can invoke the API; public access is blocked.

## Security

- Only specific Google accounts/service accounts can invoke the Cloud Run endpoint.
- All unauthenticated access is denied (403 Forbidden).

## Logging

- Every pipeline run logs to BigQuery with timestamp, brand, source, status, and message.
- Log insert responses are printed for transparency and debugging.

## How to Run

- **HTTP:**
  - `https://<cloud-run-url>/?brand=labessentials&source=shopify_customers`
  - `https://<cloud-run-url>/?brand=labessentials&source=shopify_orders`
- **CLI:**
  - `python3 pipeline.py --brand=labessentials --source=shopify_customers`
  - `python3 pipeline.py --brand=labessentials --source=shopify_orders`

## How to Deploy

- Use the provided Dockerfile and Cloud Run deployment commands.
- Update IAM as needed for new users/service accounts.

## How to Schedule

- Use Google Cloud Scheduler jobs to trigger the HTTP endpoint on a schedule.

---

For more details, see the code and comments in each file.
