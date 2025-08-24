# Onboarding Checklist

1. Clone the repo and install requirements (see README).
2. Set up your `.env` file with the correct secrets and tokens.
3. Ensure you have access to the required GCP project and BigQuery datasets.
4. Deploy the API to Cloud Run using the provided deploy command.
5. Confirm all endpoints return data:
   - `/api/metrics/sessions-daily`
   - `/api/metrics/revenue-daily`
   - `/api/clarity/top-urls`
6. Validate Cloud Scheduler jobs exist and are enabled.
7. Confirm BigQuery views are up to date and limited to 365 days.
8. Set up GCP budget alerts (50/80/100%).
9. Set up monitoring/alerts for:
   - 5xx errors in Cloud Run
   - No new Shopify or Clarity rows in 24h
10. Review the security page and OpenAPI spec.
