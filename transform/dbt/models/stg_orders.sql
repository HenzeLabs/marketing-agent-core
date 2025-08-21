{{ config(materialized='view') }}

with src as (
  select
    cast(order_number as string)     as order_number,
    cast(id as string)               as order_id,
    cast(customer_id as string)      as customer_id,
    cast(created_at as timestamp)    as created_at_ts,
    cast(updated_at as timestamp)    as updated_at_ts,
    date(cast(created_at as timestamp)) as order_date,
    cast(total_price as numeric)     as total_price,
    cast(subtotal_price as numeric)  as subtotal_price,
    cast(total_tax as numeric)       as total_tax,
    cast(total_discounts as numeric) as total_discounts,
    cast(total_shipping as numeric)  as total_shipping,
    cast(financial_status as string) as financial_status,
    cast(cancelled_at as timestamp)  as cancelled_at_ts,
    cast(currency as string)         as currency
  from {{ source('raw','shopify_orders') }}
)
select * from src;
