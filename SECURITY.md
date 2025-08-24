# Security Overview

## Data Sources

- Google Analytics 4 (GA4)
- Microsoft Clarity
- Shopify

## Data Scopes

- Only required metrics and order data are ingested.
- No PII or sensitive customer data is stored beyond what is required for analytics.

## Data Retention

- All BigQuery views are limited to the last 365 days.
- Raw data is retained per GCP project policy.

## Access Control

- Public: /api/\* endpoints (metrics, health, clarity, shopify)
- Admin: /admin/ingest/\* endpoints (token required, not exposed to public)
- Cloud Run service account: henze-gpt-agent@henzelabs-gpt.iam.gserviceaccount.com

## Secrets

- Managed via .env and GCP Secret Manager.
- Never committed to source control.

## Monitoring

- Cloud Run logs and GCP Monitoring for uptime, error rates, and cost.
- Scheduled Query alerts for data freshness.

## Who Can Access

- Only project owners and designated service accounts.
- Admin endpoints require a valid token.

## Auditing

- All admin actions are logged with job name and rows written.
