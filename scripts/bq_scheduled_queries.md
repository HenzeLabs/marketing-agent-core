# BigQuery Scheduled Queries for Data Freshness Alerts

## Shopify Orders (last 24h)

```sql
SELECT COUNT(*) FROM `henzelabs-gpt.hotash_raw.shopify_orders` WHERE created_at >= TIMESTAMP_SUB(CURRENT_TIMESTAMP(), INTERVAL 24 HOUR)
```

## Clarity Pageviews (last 24h)

```sql
SELECT COUNT(*) FROM `henzelabs-gpt.labessentials_raw.clarity_pageviews` WHERE event_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY)
```

- Set up each as a scheduled query in the BigQuery UI (every 1h or 24h).
- Add a GCP Monitoring alert on the destination table for value = 0.
