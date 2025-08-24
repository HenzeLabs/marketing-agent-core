-- Table: clarity_ai_summaries
CREATE TABLE IF NOT EXISTS `henzelabs-gpt.labessentials_raw.clarity_ai_summaries` (
  url STRING,
  snapshot_date DATE,
  pageviews INT64,
  rage_clicks INT64,
  dead_clicks INT64,
  excessive_scroll INT64,
  quick_backs INT64,
  ai_summary STRING,
  ai_recommendations STRING,
  ai_priority INT64,
  ingested_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP()
);
