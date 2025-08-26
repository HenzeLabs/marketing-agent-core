import os
import requests
import time
import json
from datetime import datetime
from google.cloud import secretmanager, bigquery

PROJECT_ID = "henzelabs-gpt"
DATASET = "lwscientific_raw"

def fetch_secret(secret_name, project_id=PROJECT_ID):
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{project_id}/secrets/{secret_name}/versions/latest"
    response = client.access_secret_version(request={"name": name})
    return response.payload.data.decode("utf-8")

def fetch_all_shopify_customers():
    token = fetch_secret("lwscientific_prod_shopify_admin_api_token")
    shop_name = fetch_secret("lwscientific_shopify_shop_name")
    url = f"https://{shop_name}/admin/api/2023-10/customers.json"

    headers = {
        "X-Shopify-Access-Token": token,
        "Content-Type": "application/json"
    }

    customers = []
    params = {"limit": 250}
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
        batch = response.json().get("customers", [])
        if not batch:
            break
        customers.extend(batch)
        link_header = response.headers.get("Link", "")
        if 'rel="next"' in link_header:
            url = link_header.split(";")[0].strip("<>")
        else:
            break
    return customers

def fetch_all_shopify_orders():
    token = fetch_secret("lwscientific_prod_shopify_admin_api_token")
    shop_name = fetch_secret("lwscientific_shopify_shop_name")
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

def transform_customers(customers):
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

def transform_orders(orders):
    return [
        {
            "id": o.get("id"),
            "order_number": o.get("order_number"),
            "created_at": o.get("created_at"),
            "updated_at": o.get("updated_at"),
            "total_price": o.get("total_price"),
            "subtotal_price": o.get("subtotal_price"),
            "total_tax": o.get("total_tax"),
            "currency": o.get("currency"),
            "financial_status": o.get("financial_status"),
            "fulfillment_status": o.get("fulfillment_status"),
            "customer_id": o.get("customer", {}).get("id") if o.get("customer") else None,
            "customer_email": o.get("customer", {}).get("email") if o.get("customer") else None,
            "raw_order_data": json.dumps(o),
            "ingested_at": datetime.utcnow().isoformat()
        }
        for o in orders
    ]

def insert_customers_into_bigquery(transformed_customers):
    client = bigquery.Client(project=PROJECT_ID)
    table_id = f"{PROJECT_ID}.{DATASET}.shopify_customers"
    print(f"Inserting into BigQuery table: {table_id}")
    
    errors = client.insert_rows_json(table_id, transformed_customers, row_ids=[None]*len(transformed_customers))
    if errors:
        raise RuntimeError(f"BigQuery insert failed: {errors}")
    print(f"✅ Inserted {len(transformed_customers)} customers into BigQuery.")

def insert_orders_into_bigquery(transformed_orders):
    client = bigquery.Client(project=PROJECT_ID)
    table_id = f"{PROJECT_ID}.{DATASET}.shopify_orders"
    print(f"Inserting into BigQuery table: {table_id}")
    
    errors = client.insert_rows_json(table_id, transformed_orders, row_ids=[None]*len(transformed_orders))
    if errors:
        raise RuntimeError(f"BigQuery insert failed: {errors}")
    print(f"✅ Inserted {len(transformed_orders)} orders into BigQuery.")

def run_shopify_customers_pipeline():
    print("🚀 Starting Shopify Customers Pipeline for lwscientific")
    customers = fetch_all_shopify_customers()
    print(f"Fetched {len(customers)} customers.")
    transformed = transform_customers(customers)
    insert_customers_into_bigquery(transformed)

def run_shopify_orders_pipeline():
    print("🚀 Starting Shopify Orders Pipeline for lwscientific")
    orders = fetch_all_shopify_orders()
    print(f"Fetched {len(orders)} orders.")
    transformed = transform_orders(orders)
    insert_orders_into_bigquery(transformed)

if __name__ == "__main__":
    run_shopify_customers_pipeline()
    run_shopify_orders_pipeline()