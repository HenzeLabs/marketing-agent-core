-- Adjust the SOURCE_DATASET below to whichever raw dataset has GA4 data.
DECLARE SOURCE_PROJECT STRING DEFAULT 'henzelabs-gpt';
DECLARE SOURCE_DATASET STRING DEFAULT 'labessentials_raw';  -- <-- change if needed

-- Sessions per day (expects GA4 export schema with event_date, event_name)
EXECUTE IMMEDIATE FORMAT("""
CREATE OR REPLACE VIEW `henzelabs-gpt.hotash_core.v_ga4_sessions_daily` AS
WITH src AS (
  SELECT PARSE_DATE('%%Y%%m%%d', event_date) AS date, event_name
  FROM `%s.%s.ga4_events`
  WHERE PARSE_DATE('%%Y%%m%%d', event_date) >= DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY)
)
SELECT date, COUNTIF(event_name = 'session_start') AS sessions
FROM src
GROUP BY date
ORDER BY date;
""", SOURCE_PROJECT, SOURCE_DATASET);

-- Revenue per day (tries event_params 'value' / 'purchase_revenue', falls back to item sums)
EXECUTE IMMEDIATE FORMAT("""
CREATE OR REPLACE VIEW `henzelabs-gpt.hotash_core.v_ga4_revenue_daily` AS
WITH e AS (
  SELECT
  PARSE_DATE('%%Y%%m%%d', event_date) AS date,
    event_name,
    (SELECT COALESCE(
            MAX(CAST(ep.value.int_value AS FLOAT64)),
            MAX(ep.value.double_value))
     FROM UNNEST(event_params) ep
     WHERE ep.key IN ('purchase_revenue','value','revenue')) AS revenue_param,
    (SELECT SUM(CAST(it.price AS FLOAT64) * COALESCE(it.quantity,1))
     FROM UNNEST(items) it) AS revenue_items
  FROM `%s.%s.ga4_events`
  WHERE event_name IN ('purchase','refund','purchase_refund')
    AND PARSE_DATE('%%Y%%m%%d', event_date) >= DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY)
)
SELECT date, SUM(COALESCE(revenue_param, revenue_items, 0)) AS revenue
FROM e
GROUP BY date
ORDER BY date;
""", SOURCE_PROJECT, SOURCE_DATASET);

-- Clarity top URLs (extracts URL from raw_data JSON)
CREATE OR REPLACE VIEW `henzelabs-gpt.hotash_core.v_clarity_top_urls` AS
SELECT
  snapshot_date AS date,
  JSON_VALUE(raw_data, '$.Url') AS url,
  SUM(pagesViews) AS views
FROM `henzelabs-gpt.hotash_raw.clarity_pageviews`
WHERE snapshot_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY)
GROUP BY date, url
ORDER BY date DESC, views DESC;
