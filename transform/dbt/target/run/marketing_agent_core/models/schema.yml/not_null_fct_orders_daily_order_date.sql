
    select
      count(*) as failures,
      count(*) != 0 as should_warn,
      count(*) != 0 as should_error
    from (
      
    
  
    
    



select order_date
from `henzelabs-gpt`.`labessentials_raw`.`fct_orders_daily`
where order_date is null



  
  
      
    ) dbt_internal_test