CREATE TABLE IF NOT EXISTS `henzelabs-gpt.lwscientific_raw.clarity_pageviews` (
  metricName STRING,
  sessionsCount INT64,
  sessionsWithMetricPercentage FLOAT64,
  sessionsWithoutMetricPercentage FLOAT64,
  pagesViews INT64,
  subTotal INT64,
  dimension1 STRING,
  dimension2 STRING,
  dimension3 STRING,
  snapshot_date DATE,
  clarity_project_id STRING,
  ingested_at TIMESTAMP,
  raw_data JSON
);