{{ config(materialized='view') }}

{# reference the source relation so we can inspect columns #}
{% set src_rel = source('raw','shopify_orders') %}

with src as (
  select
    -- required
    cast(id as string)                                    as order_id,
    date(cast(created_at as timestamp))                   as order_date,

    -- optional fields (guarded)
    {% if column_exists(src_rel, 'order_number') -%}
      cast(order_number as string)                        as order_number,
    {%- else -%}
      cast(null as string)                                as order_number,
    {%- endif %}

    {% if column_exists(src_rel, 'customer_id') -%}
      cast(customer_id as string)                         as customer_id,
    {%- else -%}
      cast(null as string)                                as customer_id,
    {%- endif %}

    {% if column_exists(src_rel, 'updated_at') -%}
      cast(updated_at as timestamp)                       as updated_at_ts,
    {%- else -%}
      cast(null as timestamp)                             as updated_at_ts,
    {%- endif %}

    {% if column_exists(src_rel, 'total_price') -%}
      cast(total_price as numeric)                        as total_price,
    {%- elif column_exists(src_rel, 'current_total_price') -%}
      cast(current_total_price as numeric)                as total_price,
    {%- else -%}
      cast(0 as numeric)                                  as total_price,
    {%- endif %}

    {% if column_exists(src_rel, 'subtotal_price') -%}
      cast(subtotal_price as numeric)                     as subtotal_price,
    {%- else -%}
      cast(null as numeric)                               as subtotal_price,
    {%- endif %}

    {% if column_exists(src_rel, 'total_tax') -%}
      cast(total_tax as numeric)                          as total_tax,
    {%- else -%}
      cast(null as numeric)                               as total_tax,
    {%- endif %}

    {% if column_exists(src_rel, 'total_discounts') -%}
      cast(total_discounts as numeric)                    as total_discounts,
    {%- else -%}
      cast(0 as numeric)                                  as total_discounts,
    {%- endif %}

    {% if column_exists(src_rel, 'total_shipping') -%}
      cast(total_shipping as numeric)                     as total_shipping,
    {%- else -%}
      cast(0 as numeric)                                  as total_shipping,
    {%- endif %}

    {% if column_exists(src_rel, 'financial_status') -%}
      cast(financial_status as string)                    as financial_status,
    {%- else -%}
      cast(null as string)                                as financial_status,
    {%- endif %}

    {% if column_exists(src_rel, 'cancelled_at') -%}
      cast(cancelled_at as timestamp)                     as cancelled_at_ts,
    {%- else -%}
      cast(null as timestamp)                             as cancelled_at_ts,
    {%- endif %}

    {% if column_exists(src_rel, 'currency') -%}
      cast(currency as string)                            as currency
    {%- else -%}
      cast(null as string)                                as currency
    {%- endif %}
  from {{ src_rel }}
)
select * from src
