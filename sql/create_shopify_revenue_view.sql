CREATE OR REPLACE VIEW `henzelabs-gpt.hotash_core.v_shopify_revenue_daily` AS
WITH orders AS (
  SELECT
    DATE(created_at) AS date,
    -- try common money fields; fall back to cents/strings
  SAFE_CAST(total_price AS NUMERIC) AS gross,
  SAFE_CAST(subtotal_price AS NUMERIC) AS net,
  financial_status, cancelled_at
  FROM `henzelabs-gpt.hotash_raw.shopify_orders`
)
SELECT
  date,
  SUM(net)  AS revenue_net,
  SUM(gross) AS revenue_gross
FROM orders
WHERE (financial_status IN ('paid','partially_paid') OR financial_status IS NULL)
  AND cancelled_at IS NULL
  AND date >= DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY)
GROUP BY date
ORDER BY date;
