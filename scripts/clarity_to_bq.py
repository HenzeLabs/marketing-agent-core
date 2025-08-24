import os
import datetime
from google.cloud import secretmanager, bigquery
import requests

# Constants
GCP_PROJECT = "henzelabs-gpt"
BQ_DATASET = "labessentials_raw"
BQ_TABLE = "clarity_pageviews"
DAYS = 30
CHUNK = 3  # Clarity API max

# Fetch secret from Secret Manager
def get_secret(secret_id):
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{GCP_PROJECT}/secrets/{secret_id}/versions/latest"
    return client.access_secret_version(request={"name": name}).payload.data.decode("UTF-8")

clarity_api_key = get_secret("labessentials_prod_clarity_api_key")

def fetch_clarity_chunk(num_days, dimension1):
    url = "https://www.clarity.ms/export-data/api/v1/project-live-insights"
    params = {"numOfDays": str(num_days), "dimension1": dimension1}
    headers = {"Authorization": f"Bearer {clarity_api_key}"}
    resp = requests.get(url, headers=headers, params=params, timeout=30)
    resp.raise_for_status()
    return resp.json()

def load_to_bq(rows):
    client = bigquery.Client(project=GCP_PROJECT)
    table_id = f"{GCP_PROJECT}.{BQ_DATASET}.{BQ_TABLE}"
    errors = client.insert_rows_json(table_id, rows)
    if errors:
        print("BigQuery insert errors:", errors)
    else:
        print(f"Loaded {len(rows)} rows to {table_id}")

if __name__ == "__main__":
    all_rows = []
    today = datetime.date.today()
    for offset in range(0, DAYS, CHUNK):
        num_days = min(CHUNK, DAYS - offset)
        print(f"Fetching last {num_days} days (offset {offset})...")
        data = fetch_clarity_chunk(num_days, "URL")
        # data is a list of metrics, each with 'metricName' and 'information' (list)
        for metric in data:
            metric_name = metric.get("metricName")
            for info in metric.get("information", []):
                # info is expected to have 'dimension1', 'date', and metric value
                row = {
                    "dimension1": info.get("dimension1"),
                    "snapshot_date": info.get("date"),
                }
                # Use metric_name as the column for the value, if it matches schema
                if metric_name == "Traffic":
                    row["pagesViews"] = info.get("value")
                else:
                    row[metric_name] = info.get("value")
                all_rows.append(row)
    if not all_rows:
        print("No data to load.")
    else:
        load_to_bq(all_rows)
