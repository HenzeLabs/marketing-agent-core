

  create or replace view `henzelabs-gpt`.`labessentials_raw`.`fct_orders_daily`
  OPTIONS()
  as 

with valid as (
  select *
  from `henzelabs-gpt`.`labessentials_raw`.`stg_orders`
  where cancelled_at_ts is null
    and coalesce(total_price,0) >= 0
),
agg as (
  select
    order_date,
    count(*)                                        as orders,
    sum(coalesce(subtotal_price,0))                 as gross_sales,
    sum(coalesce(total_discounts,0))                as discounts,
    sum(coalesce(total_tax,0))                      as taxes,
    sum(coalesce(total_shipping,0))                 as shipping_charges,
    sum(coalesce(total_price,0))                    as total_sales
  from valid
  group by order_date
)
select * from agg;

