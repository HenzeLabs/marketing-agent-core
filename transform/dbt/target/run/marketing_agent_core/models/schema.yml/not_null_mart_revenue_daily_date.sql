
    select
      count(*) as failures,
      count(*) != 0 as should_warn,
      count(*) != 0 as should_error
    from (
      
    
  
    
    



select date
from `henzelabs-gpt`.`labessentials_raw`.`mart_revenue_daily`
where date is null



  
  
      
    ) dbt_internal_test