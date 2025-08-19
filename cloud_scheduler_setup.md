# Cloud Scheduler Setup for Shopify Customers Pipeline

This guide explains how to schedule your Shopify customers pipeline using Google Cloud Scheduler and Cloud Functions.

## 1. Deploy as a Cloud Function

You need to wrap your pipeline in an HTTP-triggered Cloud Function. Example: `main.py`

```python
from src.load_secrets import load_env_vars_from_config
from src.shopify_pipeline import run_shopify_customers_pipeline
import os

def shopify_customers_entrypoint(request):
    brand = request.args.get('brand', 'labessentials')
    config_path = request.args.get('config', 'config.yaml')
    load_env_vars_from_config(brand, config_path=config_path)
    run_shopify_customers_pipeline()
    return 'Pipeline executed', 200
```

- Requirements: Add all dependencies to `requirements.txt`.

## 2. Deploy the Function

```sh
gcloud functions deploy shopify_customers_entrypoint \
  --runtime python311 \
  --trigger-http \
  --allow-unauthenticated \
  --entry-point shopify_customers_entrypoint \
  --region=us-central1
```

## 3. Schedule with Cloud Scheduler

Create a Cloud Scheduler job to trigger the function (e.g., daily at 2am):

```sh
gcloud scheduler jobs create http shopify-customers-daily \
  --schedule="0 2 * * *" \
  --uri="https://REGION-PROJECT_ID.cloudfunctions.net/shopify_customers_entrypoint?brand=labessentials" \
  --http-method=GET
```

Replace `REGION` and `PROJECT_ID` with your values.

## 4. Security

- For production, restrict the function to only allow requests from Cloud Scheduler or use authentication.

---

**Summary:**

- Wrap your pipeline in an HTTP Cloud Function
- Deploy to Google Cloud Functions
- Schedule with Cloud Scheduler
- Monitor logs in Google Cloud Console
