-- BigQuery View: v_clarity_url_daily
-- Pivots Clarity metrics per (snapshot_date, url)

CREATE OR REPLACE VIEW `henzelabs-gpt.labessentials_raw.v_clarity_url_daily` AS
SELECT
  snapshot_date,
  dimension1 AS url,
  SUM(pagesViews) AS pageviews,
  SUM(IF(metricName = 'rage_clicks', subTotal, 0)) AS rage_clicks,
  SUM(IF(metricName = 'dead_clicks', subTotal, 0)) AS dead_clicks,
  SUM(IF(metricName = 'excessive_scroll', subTotal, 0)) AS excessive_scroll,
  SUM(IF(metricName = 'quick_backs', subTotal, 0)) AS quick_backs
FROM
  `henzelabs-gpt.labessentials_raw.clarity_pageviews`
WHERE
  snapshot_date IS NOT NULL
  AND dimension1 IS NOT NULL
GROUP BY snapshot_date, url;
