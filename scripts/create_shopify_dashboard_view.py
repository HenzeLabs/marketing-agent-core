from google.cloud import bigquery

client = bigquery.Client(project="henzelabs-gpt")

query = """
CREATE OR REPLACE VIEW `henzelabs-gpt.labessentials_raw.v_shopify_dashboard_metrics` AS
WITH base AS (
  SELECT
    id,
    SAFE_CAST(total_price AS FLOAT64) AS total_price,
    email
  FROM `henzelabs-gpt.labessentials_raw.shopify_orders`
  WHERE total_price IS NOT NULL AND email IS NOT NULL
),
customer_orders AS (
  SELECT
    email,
    COUNT(DISTINCT id) AS order_count
  FROM base
  GROUP BY email
)
SELECT
  SUM(total_price) AS total_revenue,
  COUNT(DISTINCT id) AS number_of_orders,
  SAFE_DIVIDE(SUM(total_price), COUNT(DISTINCT id)) AS average_order_value,
  COUNT(DISTINCT email) AS unique_customers,
  SAFE_DIVIDE(
    COUNTIF(order_count > 1),
    COUNT(*)
  ) AS repeat_purchase_rate
FROM base
LEFT JOIN customer_orders USING (email);
"""

job = client.query(query)
job.result()
print("✅ View created: v_shopify_dashboard_metrics")
