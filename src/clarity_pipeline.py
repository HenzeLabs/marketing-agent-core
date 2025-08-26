import os
from src.utils.clarity import fetch_clarity_data
from shared.bigquery import insert_rows_into_table

def run_clarity_pipeline(brand: str):
    print(f"[Clarity] Running Clarity pipeline for brand: {brand}")

    # Fetch data
    data = fetch_clarity_data(brand)

    if not data or not data.get("data"):
        print("[Clarity] No data returned.")
        return

    # Transform data
    rows_to_insert = data.get("data")

    # Insert into BigQuery
    project_id = os.environ.get("GOOGLE_CLOUD_PROJECT", "henzelabs-gpt")
    dataset_id = f"{brand}_raw"
    table_id = "clarity_events"
    full_table_id = f"{project_id}.{dataset_id}.{table_id}"

    errors = insert_rows_into_table(full_table_id, rows_to_insert)

    if errors:
        print(f"[Clarity] Errors inserting rows into BigQuery: {errors}")
    else:
        print(f"[Clarity] Successfully inserted {len(rows_to_insert)} rows into BigQuery.")
