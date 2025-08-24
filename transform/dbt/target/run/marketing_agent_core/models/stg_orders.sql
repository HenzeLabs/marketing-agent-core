

  create or replace view `henzelabs-gpt`.`labessentials_raw`.`stg_orders`
  OPTIONS()
  as 




with src as (
  select
    -- required
    cast(id as string)                                    as order_id,
    date(cast(created_at as timestamp))                   as order_date,

    -- optional fields (guarded)
    cast(order_number as string)                        as order_number,

    cast(null as string)                                as customer_id,

    cast(null as timestamp)                             as updated_at_ts,

    cast(total_price as numeric)                        as total_price,

    cast(subtotal_price as numeric)                     as subtotal_price,

    cast(total_tax as numeric)                          as total_tax,

    cast(total_discounts as numeric)                    as total_discounts,

    cast(0 as numeric)                                  as total_shipping,

    cast(financial_status as string)                    as financial_status,

    cast(cancelled_at as timestamp)                     as cancelled_at_ts,

    cast(currency as string)                            as currency
  from `henzelabs-gpt`.`labessentials_raw`.`shopify_orders`
)
select * from src;

