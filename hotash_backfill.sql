DECLARE d0 DATE DEFAULT DATE_SUB(CURRENT_DATE(), INTERVAL 90 DAY);
DECLARE d1 DATE DEFAULT CURRENT_DATE();
MERGE `henzelabs-gpt.hotash_raw.ga4_daily_metrics` T
USING (
  SELECT event_date AS date,
         COUNTIF(event_name='session_start') AS sessions,
         CAST(NULL AS INT64) AS total_users,
         CAST(NULL AS INT64) AS new_users,
         CAST(NULL AS INT64) AS engaged_sessions,
         CAST(NULL AS FLOAT64) AS avg_session_duration_seconds,
         CAST(NULL AS FLOAT64) AS bounce_rate
  FROM `henzelabs-gpt.hotash_raw.ga4_events`
  WHERE event_date BETWEEN d0 AND d1 AND event_name='session_start'
  GROUP BY 1
) S
ON T.date=S.date
WHEN MATCHED THEN UPDATE SET sessions=S.sessions
WHEN NOT MATCHED THEN INSERT ROW;