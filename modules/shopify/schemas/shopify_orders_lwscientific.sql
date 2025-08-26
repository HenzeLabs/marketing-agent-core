CREATE TABLE IF NOT EXISTS `henzelabs-gpt.lwscientific_raw.shopify_orders` (
  id STRING,
  created_at TIMESTAMP,
  processed_at TIMESTAMP,
  cancelled_at TIMESTAMP,
  total_price STRING,
  subtotal_price STRING,
  total_discounts STRING,
  total_tax STRING,
  currency STRING,
  email STRING,
  financial_status STRING,
  fulfillment_status STRING,
  name STRING,
  order_number INT64,
  raw_order_data JSON,
  ingested_at TIMESTAMP
);