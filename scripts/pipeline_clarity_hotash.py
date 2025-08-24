import os
import json
from datetime import datetime, UTC
import requests
from google.cloud import secretmanager, bigquery

PROJECT_ID = "henzelabs-gpt"
DATASET = "hotash_raw"
TABLE = "clarity_pageviews"
TABLE_ID = f"{PROJECT_ID}.{DATASET}.{TABLE}"

ALLOWED_FIELDS = {
    "metricName","sessionsCount","sessionsWithMetricPercentage","sessionsWithoutMetricPercentage",
    "pagesViews","subTotal","dimension1","dimension2","dimension3",
    "snapshot_date","clarity_project_id","ingested_at","raw_data"
}

def to_int(x):
    return int(x) if x not in (None, "") else 0

def to_float(x):
    return float(x) if x not in (None, "") else 0.0

def normalize_row(orig_row: dict, clarity_project_id: str, snapshot_date: str, ingested_at_iso: str) -> dict:
    r = dict(orig_row)
    r["sessionsCount"] = to_int(r.get("sessionsCount"))
    r["pagesViews"] = to_int(r.get("pagesViews"))
    r["subTotal"] = to_int(r.get("subTotal"))
    r["sessionsWithMetricPercentage"] = to_float(r.get("sessionsWithMetricPercentage"))
    r["sessionsWithoutMetricPercentage"] = to_float(r.get("sessionsWithoutMetricPercentage"))
    r["snapshot_date"] = snapshot_date
    r["ingested_at"] = ingested_at_iso
    r["clarity_project_id"] = clarity_project_id
    for d in ("dimension1","dimension2","dimension3"):
        if d not in r:
            r[d] = None
    r["raw_data"] = json.dumps(orig_row, separators=(",", ":"))
    return {k: r.get(k) for k in ALLOWED_FIELDS}

def fetch_secret(secret_name, project_id=PROJECT_ID):
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{project_id}/secrets/{secret_name}/versions/latest"
    response = client.access_secret_version(request={"name": name})
    return response.payload.data.decode("utf-8")

def fetch_clarity_pageviews(api_key, clarity_project_id, days=1):
    if days not in (1, 2, 3):
        raise ValueError("Clarity Data Export API only supports numOfDays=1, 2, or 3.")
    url = "https://www.clarity.ms/export-data/api/v1/project-live-insights"
    headers = {"Authorization": f"Bearer {api_key}"}
    params = {
        "projectId": clarity_project_id,
        "numOfDays": days,
        "dimension1": "URL"
    }
    print(f"Fetching Clarity Data Export API for last {days} day(s)...")
    session = requests.Session()
    session.trust_env = False
    response = session.get(url, headers=headers, params=params, timeout=60)
    response.raise_for_status()
    data = response.json()
    print(f"Fetched {len(data)} records from Clarity Data Export API.")
    return data

def flatten_pageview(row):
    metric = row.get("metricName")
    info_list = row.get("information", [])
    flattened = []
    for info in info_list:
        flat_row = {"metricName": metric}
        flat_row.update(info)
        flattened.append(flat_row)
    return flattened

def run_clarity_pipeline():
    print("🚀 Starting Clarity Pageviews Pipeline for hotash")
    api_key = fetch_secret("hotash_prod_clarity_api_key")
    clarity_project_id = fetch_secret("hotash_clarity_project_id")
    print("Fetched secrets from Secret Manager.")
    raw_data = fetch_clarity_pageviews(api_key, clarity_project_id, days=1)
    if not raw_data or not isinstance(raw_data, list):
        raise ValueError("No data returned or data is not a list.")
    all_flat = []
    for row in raw_data:
        all_flat.extend(flatten_pageview(row))
    print("\nSample of first 3 fully flattened rows:")
    import json as _json; [print(f"Row {i+1}:\n{_json.dumps(r, indent=2)}") for i, r in enumerate(all_flat[:3])]
    if not all_flat:
        print("No rows to insert into BigQuery."); return
    utcnow = datetime.now(UTC)
    today = utcnow.date().isoformat()
    iso_now = utcnow.isoformat()
    enriched_rows = [normalize_row(r, clarity_project_id, today, iso_now) for r in all_flat]
    client = bigquery.Client(project=PROJECT_ID)
    insert_ids = [f"{clarity_project_id}|{r.get('metricName','')}|{today}" for r in enriched_rows]
    print(f"Inserting {len(enriched_rows)} rows into BigQuery table {TABLE_ID}...")
    errors = client.insert_rows_json(TABLE_ID, enriched_rows, row_ids=insert_ids)
    if errors:
        raise RuntimeError(f"BigQuery insert failed: {errors}")
    print(f"✅ Inserted {len(enriched_rows)} rows into {TABLE_ID}.")
    return

if __name__ == "__main__":
    run_clarity_pipeline()
