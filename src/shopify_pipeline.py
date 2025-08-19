def run_shopify_orders_pipeline():
    from shared.logging import setup_logging
    logger = setup_logging()
    logger.info("🚀 Starting Shopify Orders Pipeline")
    try:
        orders = fetch_all_shopify_orders()
        logger.info(f"Fetched {len(orders)} orders.")
        transformed = transform_orders(orders)
        insert_into_bigquery(transformed)
    except Exception as e:
        logger.error(f"Orders pipeline failed: {e}", exc_info=True)
        raise
def fetch_all_shopify_customers():
    token = os.environ["LABESSENTIALS_PROD_SHOPIFY_ADMIN_API_TOKEN"]
    shop_name = os.environ["LABESSENTIALS_SHOPIFY_SHOP_NAME"]
    url = f"https://{shop_name}/admin/api/2023-10/customers.json"

    headers = {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json"
    }

    customers = []
    from datetime import datetime, timedelta
    three_years_ago = (datetime.utcnow() - timedelta(days=3*365)).strftime("%Y-%m-%dT%H:%M:%S")
    # TEMP: limit to 50 for debugging
    params = {
        "limit": 50,  # TEMP: reduce batch size for debugging
        "created_at_min": three_years_ago
    }
    first_page = True
    previous_page_info = None
    max_pages = 100
    page_counter = 0
    def extract_next_url_from_link(link_header):
        if 'rel="next"' in link_header:
            return link_header.split(";")[0].strip("<>")
        return None

    from shared.logging import setup_logging
    logger = setup_logging()
    while url and page_counter < max_pages:
        logger.info(f"Fetching: {url}")
        try:
            if first_page:
                response = requests.get(url, headers=headers, params=params)
                first_page = False
            else:
                response = requests.get(url, headers=headers, params=None)
            if response.status_code == 429:
                retry_after = int(response.headers.get("Retry-After", 2))
                logger.warning(f"Rate limited, sleeping {retry_after} seconds...")
                time.sleep(retry_after)
                continue
            response.raise_for_status()
            batch = response.json().get("customers", [])
            logger.info(f"Fetched batch of {len(batch)} customers.")
            if not batch:
                break
            customers.extend(batch)
            logger.info(f"Total customers fetched so far: {len(customers)}")
            link_header = response.headers.get("Link", "")
            next_url = extract_next_url_from_link(link_header)
            if next_url == previous_page_info:
                logger.error("🚨 Pagination loop detected. Breaking.")
                break
            previous_page_info = next_url
            url = next_url
            page_counter += 1
        except Exception as e:
            logger.error(f"Error fetching customers: {e}", exc_info=True)
            break
    if page_counter >= max_pages:
        logger.warning(f"🚨 Max page limit ({max_pages}) reached. Stopping pagination.")
    logger.info(f"Returning {len(customers)} customers from fetch_all_shopify_customers.")
    return customers

def transform_customers(customers):
    import json
    from datetime import datetime
    return [
        {
            "id": c.get("id"),
            "first_name": c.get("first_name"),
            "last_name": c.get("last_name"),
            "email": c.get("email"),
            "accepts_marketing": c.get("accepts_marketing"),
            "accepts_marketing_sms": c.get("accepts_marketing_sms"),
            "phone": c.get("phone"),
            "total_spent": c.get("total_spent"),
            "orders_count": c.get("orders_count"),
            "default_address_city": (c.get("default_address") or {}).get("city"),
            "default_address_country_code": (c.get("default_address") or {}).get("country_code"),
            "default_address_zip": (c.get("default_address") or {}).get("zip"),
            "raw_customer_data": json.dumps(c),
            "ingested_at": datetime.utcnow().isoformat()
        }
        for c in customers
    ]

def insert_customers_into_bigquery(transformed_customers):
    from shared.logging import setup_logging
    logger = setup_logging()
    try:
        client = bigquery.Client()
        project = os.environ.get('LABESSENTIALS_GCP_PROJECT_ID')
        dataset = os.environ.get('LABESSENTIALS_BIGQUERY_DATASET')
        table_id = f"{project}.{dataset}.shopify_customers"
        logger.info(f"BigQuery project: {project}")
        logger.info(f"BigQuery dataset: {dataset}")
        logger.info(f"BigQuery table_id: {table_id}")

        job_config = bigquery.LoadJobConfig(
            write_disposition="WRITE_APPEND",
            schema=[
                bigquery.SchemaField("id", "STRING"),
                bigquery.SchemaField("first_name", "STRING"),
                bigquery.SchemaField("last_name", "STRING"),
                bigquery.SchemaField("email", "STRING"),
                bigquery.SchemaField("accepts_marketing", "BOOL"),
                bigquery.SchemaField("accepts_marketing_sms", "BOOL"),
                bigquery.SchemaField("phone", "STRING"),
                bigquery.SchemaField("total_spent", "STRING"),
                bigquery.SchemaField("orders_count", "INT64"),
                bigquery.SchemaField("default_address_city", "STRING"),
                bigquery.SchemaField("default_address_country_code", "STRING"),
                bigquery.SchemaField("default_address_zip", "STRING"),
                bigquery.SchemaField("raw_customer_data", "JSON"),
                bigquery.SchemaField("ingested_at", "TIMESTAMP"),
            ]
        )

        errors = client.insert_rows_json(table_id, transformed_customers, row_ids=[None]*len(transformed_customers))
        if errors:
            logger.error(f"BigQuery insert failed: {errors}")
            raise RuntimeError(f"BigQuery insert failed: {errors}")
        logger.info(f"✅ Inserted {len(transformed_customers)} customers into BigQuery.")
    except Exception as e:
        logger.error(f"Error inserting into BigQuery: {e}", exc_info=True)
        raise

def run_shopify_customers_pipeline():
    from shared.logging import setup_logging
    logger = setup_logging()
    logger.info("🚀 Starting Shopify Customers Pipeline")
    try:
        customers = fetch_all_shopify_customers()
        logger.info(f"Fetched {len(customers)} customers.")
        transformed = transform_customers(customers)
        insert_customers_into_bigquery(transformed)
    except Exception as e:
        logger.error(f"Pipeline failed: {e}", exc_info=True)
        raise
import os
import requests
from google.cloud import bigquery
from datetime import datetime
import time
import json

def fetch_all_shopify_orders():
    token = os.environ["LABESSENTIALS_PROD_SHOPIFY_ADMIN_API_TOKEN"]
    shop_name = os.environ["LABESSENTIALS_SHOPIFY_SHOP_NAME"]
    url = f"https://{shop_name}/admin/api/2023-10/orders.json"

    headers = {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json"
    }

    orders = []
    params = {"limit": 250, "status": "any"}
    first_page = True
    while url:
        print(f"Fetching: {url}")
        if first_page:
            response = requests.get(url, headers=headers, params=params)
            first_page = False
        else:
            response = requests.get(url, headers=headers, params=None)
        if response.status_code == 429:
            retry_after = int(response.headers.get("Retry-After", 2))
            print(f"Rate limited, sleeping {retry_after} seconds...")
            time.sleep(retry_after)
            continue
        response.raise_for_status()
        batch = response.json().get("orders", [])
        if not batch:
            break
        orders.extend(batch)
        link_header = response.headers.get("Link", "")
        if 'rel="next"' in link_header:
            url = link_header.split(";")[0].strip("<>")
        else:
            break
    return orders

def transform_orders(orders):
    return [
        {
            "id": o.get("id"),
            "created_at": o.get("created_at"),
            "processed_at": o.get("processed_at"),
            "cancelled_at": o.get("cancelled_at"),
            "total_price": o.get("total_price"),
            "subtotal_price": o.get("subtotal_price"),
            "total_discounts": o.get("total_discounts"),
            "total_tax": o.get("total_tax"),
            "currency": o.get("currency"),
            "email": "[REDACTED]",
            "financial_status": o.get("financial_status"),
            "fulfillment_status": o.get("fulfillment_status"),
            "name": o.get("name"),
            "order_number": o.get("order_number"),
            "raw_order_data": json.dumps(o),  # store full JSON as string for BigQuery JSON field
            "ingested_at": datetime.utcnow().isoformat()
        }
        for o in orders
    ]

def insert_into_bigquery(transformed_orders):
    client = bigquery.Client()
    project = os.environ.get('LABESSENTIALS_GCP_PROJECT_ID')
    dataset = os.environ.get('LABESSENTIALS_BIGQUERY_DATASET')
    table_id = f"{project}.{dataset}.shopify_orders"
    print(f"BigQuery project: {project}")
    print(f"BigQuery dataset: {dataset}")
    print(f"BigQuery table_id: {table_id}")

    job_config = bigquery.LoadJobConfig(
        write_disposition="WRITE_APPEND",
        schema=[
            bigquery.SchemaField("id", "STRING"),
            bigquery.SchemaField("created_at", "TIMESTAMP"),
            bigquery.SchemaField("processed_at", "TIMESTAMP"),
            bigquery.SchemaField("cancelled_at", "TIMESTAMP"),
            bigquery.SchemaField("total_price", "STRING"),
            bigquery.SchemaField("subtotal_price", "STRING"),
            bigquery.SchemaField("total_discounts", "STRING"),
            bigquery.SchemaField("total_tax", "STRING"),
            bigquery.SchemaField("currency", "STRING"),
            bigquery.SchemaField("email", "STRING"),
            bigquery.SchemaField("financial_status", "STRING"),
            bigquery.SchemaField("fulfillment_status", "STRING"),
            bigquery.SchemaField("name", "STRING"),
            bigquery.SchemaField("order_number", "INT64"),
            bigquery.SchemaField("raw_order_data", "JSON"),
            bigquery.SchemaField("ingested_at", "TIMESTAMP"),
        ]
    )

    errors = client.insert_rows_json(table_id, transformed_orders, row_ids=[None]*len(transformed_orders))
    if errors:
        raise RuntimeError(f"BigQuery insert failed: {errors}")
    print(f"✅ Inserted {len(transformed_orders)} orders into BigQuery.")

def run():
    print("🚀 Starting Shopify Orders Pipeline")
    orders = fetch_all_shopify_orders()
    print(f"Fetched {len(orders)} orders.")
    transformed = transform_orders(orders)
    insert_into_bigquery(transformed)