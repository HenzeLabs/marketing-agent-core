-- BigQuery View: v_clarity_url_daily for lwscientific
-- Daily aggregated Clarity URL metrics

CREATE OR REPLACE VIEW `henzelabs-gpt.lwscientific_raw.v_clarity_url_daily` AS
SELECT
  snapshot_date,
  dimension1 as url,
  SUM(sessionsCount) as total_sessions,
  SUM(pagesViews) as total_page_views,
  AVG(sessionsWithMetricPercentage) as avg_sessions_with_metric_pct,
  COUNT(*) as metric_count,
  clarity_project_id
FROM
  `henzelabs-gpt.lwscientific_raw.clarity_pageviews`
WHERE
  snapshot_date IS NOT NULL
  AND dimension1 IS NOT NULL
GROUP BY
  snapshot_date,
  dimension1,
  clarity_project_id
ORDER BY
  snapshot_date DESC,
  total_sessions DESC;