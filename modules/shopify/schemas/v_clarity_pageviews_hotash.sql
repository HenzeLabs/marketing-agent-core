-- BigQuery View: v_clarity_pageviews for hotash
-- Exposes flattened Clarity pageview metrics for dashboard and API

CREATE OR REPLACE VIEW `henzelabs-gpt.hotash_raw.v_clarity_pageviews` AS
SELECT
  snapshot_date,
  metricName,
  sessionsCount,
  pagesViews,
  subTotal,
  sessionsWithMetricPercentage,
  sessionsWithoutMetricPercentage,
  dimension1,
  dimension2,
  dimension3,
  clarity_project_id,
  ingested_at
FROM
  `henzelabs-gpt.hotash_raw.clarity_pageviews`
WHERE
  snapshot_date IS NOT NULL;
