{{ config(materialized='view') }}

-- Aggregate GA4 events to session-level, then to day-level
with session_rollup as (
  select
    event_date,
    user_pseudo_id,
    ga_session_id,
    sum(engagement_time_msec) as session_engagement_time_msec,
    sum(case when is_page_view then 1 else 0 end) as session_pageviews,
    max(case when is_session_start then 1 else 0 end) as has_session_start
  from {{ ref('stg_ga4_sessions') }}
  group by 1,2,3
),
day_rollup as (
  select
    event_date,
    countif(has_session_start = 1 or session_pageviews > 0) as sessions,
    count(distinct user_pseudo_id)                         as users,
    sum(session_pageviews)                                  as pageviews,
    sum(session_engagement_time_msec)                       as total_engagement_time_msec,
    countif(session_pageviews >= 2)                         as engaged_sessions_est
  from session_rollup
  group by event_date
)
select
  event_date,
  sessions,
  users,
  pageviews,
  total_engagement_time_msec,
  engaged_sessions_est,
  safe_divide(total_engagement_time_msec, nullif(sessions,0)) / 1000.0 as avg_session_duration_sec,
  safe_divide(engaged_sessions_est, nullif(sessions,0))                as engagement_rate_est
from day_rollup;
