import os
from src.utils.ga4 import fetch_ga4_data
from shared.bigquery import insert_rows_into_table

def run_ga4_pipeline(brand: str):
    print(f"[GA4] Running GA4 pipeline for brand: {brand}")

    # Fetch data
    response = fetch_ga4_data(brand)

    if not response or not response.rows:
        print("[GA4] No data returned.")
        return

    # Transform data
    rows_to_insert = []
    for row in response.rows:
        rows_to_insert.append({
            "date": row.dimension_values[0].value,
            "eventName": row.dimension_values[1].value,
            "eventCount": row.metric_values[0].value,
        })

    # Insert into BigQuery
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT", "henzelabs-gpt")
    dataset_id = f"{brand}_raw"
    table_id = "ga4_events"
    full_table_id = f"{project_id}.{dataset_id}.{table_id}"

    errors = insert_rows_into_table(full_table_id, rows_to_insert)

    if errors:
        print(f"[GA4] Errors inserting rows into BigQuery: {errors}")
    else:
        print(f"[GA4] Successfully inserted {len(rows_to_insert)} rows into BigQuery.")