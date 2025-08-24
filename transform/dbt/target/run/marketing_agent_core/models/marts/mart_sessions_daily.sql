
  
    

    create or replace table `henzelabs-gpt`.`labessentials_raw`.`mart_sessions_daily`
      
    
    

    
    OPTIONS()
    as (
      

select
  event_date as date,
  sessions,
  users,
  pageviews,
  avg_session_duration_sec,
  engagement_rate_est
from `henzelabs-gpt`.`labessentials_raw`.`fct_sessions_daily`
order by date
    );
  