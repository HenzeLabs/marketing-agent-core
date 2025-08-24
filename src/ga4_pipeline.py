from src.utils.secret_loader import get_secret
from src.utils.bigquery import insert_rows_into_bigquery
from src.utils.ga4 import fetch_ga4_data  # adjust if your fetch logic lives elsewhere

def run_ga4_pipeline(brand: str):
    print(f"[GA4] Running GA4 pipeline for brand: {brand}")

    # Fetch data (you can parameterize timeframe or hardcode for now)
    ga4_data = fetch_ga4_data(brand)

    if not ga4_data:
        print("[GA4] No data returned.")
        return

    # Insert into BigQuery
    insert_rows_into_bigquery(
        data=ga4_data,
        dataset_id=f"{brand}_raw",
        table_id="ga4_events",  # adjust if your table is named differently
        project_id="henzelabs-gpt"
    )
