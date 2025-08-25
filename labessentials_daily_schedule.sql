DECLARE y STRING DEFAULT FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 1 DAY));
MERGE `henzelabs-gpt.labessentials_raw.ga4_daily_metrics` T
USING (
  SELECT PARSE_DATE('%Y%m%d', event_date) AS date,
         COUNTIF(event_name='session_start') AS sessions,
         CAST(NULL AS INT64) AS total_users,
         CAST(NULL AS INT64) AS new_users,
         CAST(NULL AS INT64) AS engaged_sessions,
         CAST(NULL AS FLOAT64) AS avg_session_duration_seconds,
         CAST(NULL AS FLOAT64) AS bounce_rate
  FROM `henzelabs-gpt.labessentials_raw.ga4_events`
  WHERE event_date = y AND event_name='session_start'
  GROUP BY 1
) S
ON T.date=S.date
WHEN MATCHED THEN UPDATE SET sessions=S.sessions
WHEN NOT MATCHED THEN INSERT ROW;