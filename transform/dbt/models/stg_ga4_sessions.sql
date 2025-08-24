{{ config(materialized='view') }}

with base as (
  select
    cast(event_date as date) as event_date,
    event_name,
    user_pseudo_id,
    (select ep.value.int_value from unnest(event_params) ep where ep.key = 'ga_session_id') as ga_session_id,
    (select ep.value.int_value from unnest(event_params) ep where ep.key = 'engagement_time_msec') as engagement_time_msec
  from {{ source('raw','ga4_events') }}
),
filtered as (
  select
    event_date,
    user_pseudo_id,
    ga_session_id,
    event_name,
    coalesce(engagement_time_msec, 0) as engagement_time_msec,
    event_name = 'session_start' as is_session_start,
    event_name = 'page_view' as is_page_view
  from base
  where ga_session_id is not null
)
select * from filtered
