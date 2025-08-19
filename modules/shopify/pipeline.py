def run_shopify_orders_pipeline():
	"""Stub for Shopify orders pipeline. Implement as needed."""
	pass
import os
import requests
import time
import json
from datetime import datetime

def fetch_all_shopify_customers():
	token = os.environ["LABESSENTIALS_PROD_SHOPIFY_ADMIN_API_TOKEN"]
	shop_name = os.environ["LABESSENTIALS_SHOPIFY_SHOP_NAME"]
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

def insert_customers_into_bigquery(transformed_customers):
	from google.cloud import bigquery
	client = bigquery.Client()
	project = os.environ.get('LABESSENTIALS_GCP_PROJECT_ID')
	dataset = os.environ.get('LABESSENTIALS_BIGQUERY_DATASET')
	table_id = f"{project}.{dataset}.shopify_customers"
	print(f"BigQuery project: {project}")
	print(f"BigQuery dataset: {dataset}")
	print(f"BigQuery table_id: {table_id}")

	errors = client.insert_rows_json(table_id, transformed_customers, row_ids=[None]*len(transformed_customers))
	if errors:
		raise RuntimeError(f"BigQuery insert failed: {errors}")
	print(f"✅ Inserted {len(transformed_customers)} customers into BigQuery.")

def run_shopify_customers_pipeline():
	print("🚀 Starting Shopify Customers Pipeline")
	customers = fetch_all_shopify_customers()
	print(f"Fetched {len(customers)} customers.")
	transformed = transform_customers(customers)
	insert_customers_into_bigquery(transformed)
