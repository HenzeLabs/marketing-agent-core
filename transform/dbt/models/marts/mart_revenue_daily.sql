{{ config(materialized='table') }}

select
  order_date as date,
  orders,
  gross_sales,
  discounts,
  taxes,
  shipping_charges,
  total_sales,
  -- convenience metrics
  safe_divide(discounts, nullif(gross_sales,0)) as discount_rate,
  safe_divide(total_sales, nullif(orders,0))    as aov
from {{ ref('fct_orders_daily') }}
order by date
