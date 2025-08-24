
    
    

with dbt_test__target as (

  select order_date as unique_field
  from `henzelabs-gpt`.`labessentials_raw`.`fct_orders_daily`
  where order_date is not null

)

select
    unique_field,
    count(*) as n_records

from dbt_test__target
group by unique_field
having count(*) > 1


