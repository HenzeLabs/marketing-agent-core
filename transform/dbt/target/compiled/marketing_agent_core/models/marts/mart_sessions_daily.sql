

select
  event_date as date,
  sessions,
  users,
  pageviews,
  avg_session_duration_sec,
  engagement_rate_est
from `henzelabs-gpt`.`labessentials_raw`.`fct_sessions_daily`
order by date