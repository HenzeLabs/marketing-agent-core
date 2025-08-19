from google.cloud import bigquery

client = bigquery.Client(project="henzelabs-gpt")

query = """
CREATE OR REPLACE VIEW `henzelabs-gpt.labessentials_raw.v_shopify_dashboard_metrics` AS
SELECT
  SUM(total_price) AS total_revenue,
  COUNT(DISTINCT id) AS number_of_orders,
  SAFE_DIVIDE(SUM(total_price), COUNT(DISTINCT id)) AS average_order_value,
  COUNT(DISTINCT customer.email) AS unique_customers,
  SAFE_DIVIDE(
    COUNT(DISTINCT CASE WHEN order_count > 1 THEN customer.email END),
    COUNT(DISTINCT customer.email)
  ) AS repeat_purchase_rate
FROM `henzelabs-gpt.labessentials_raw.shopify_orders`
LEFT JOIN UNNEST(customer) AS customer
WHERE total_price IS NOT NULL;
"""

job = client.query(query)
job.result()
print("✅ View created: v_shopify_dashboard_metrics")
