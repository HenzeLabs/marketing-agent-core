from google.cloud import bigquery
from typing import List, Dict, Any

def insert_rows_into_bigquery(data: List[Dict[str, Any]], dataset_id: str, table_id: str, project_id: str):
    client = bigquery.Client(project=project_id)
    table_ref = f"{project_id}.{dataset_id}.{table_id}"
    errors = client.insert_rows_json(table_ref, data)
    if errors:
        print(f"BigQuery insert errors: {errors}")
        raise RuntimeError(f"BigQuery insert failed: {errors}")
    print(f"✅ Inserted {len(data)} rows into {table_ref}.")
