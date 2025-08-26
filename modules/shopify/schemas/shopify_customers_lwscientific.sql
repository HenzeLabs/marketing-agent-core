CREATE TABLE IF NOT EXISTS `henzelabs-gpt.lwscientific_raw.shopify_customers` (
  id STRING,
  first_name STRING,
  last_name STRING,
  email STRING,
  accepts_marketing BOOL,
  accepts_marketing_sms BOOL,
  phone STRING,
  total_spent STRING,
  orders_count INT64,
  default_address_city STRING,
  default_address_country_code STRING,
  default_address_zip STRING,
  raw_customer_data JSON,
  ingested_at TIMESTAMP
);