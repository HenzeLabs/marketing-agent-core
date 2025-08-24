CREATE OR REPLACE VIEW `henzelabs-gpt.hotash_core.v_revenue_daily_unified` AS
WITH ga4 AS (
  SELECT date, revenue AS revenue_net
  FROM `henzelabs-gpt.hotash_core.v_ga4_revenue_daily`
  WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY)
),
shop AS (
  SELECT date, revenue_net
  FROM `henzelabs-gpt.hotash_core.v_shopify_revenue_daily`
  WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY)
)
SELECT date, revenue_net
FROM ga4
UNION ALL
SELECT s.date, s.revenue_net
FROM shop s
LEFT JOIN ga4 g USING (date)
WHERE g.date IS NULL
ORDER BY date;
