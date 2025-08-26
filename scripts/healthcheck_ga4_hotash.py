from google.cloud import bigquery
from datetime import date, timedelta

PROJECT = "henzelabs-gpt"
RAW_DS = "hotash_raw"

client = bigquery.Client(project=PROJECT)

query = f"""
WITH W AS (SELECT DATE_SUB(CURRENT_DATE(), INTERVAL 2 DAY) d)
SELECT COUNT(*)
FROM `{PROJECT}.{RAW_DS}.ga4_daily_metrics`, W
WHERE date >= W.d
"""

query_job = client.query(query)

results = query_job.result()

for row in results:
    rows = row[0]
    print(f"ga4_daily_metrics_rows_last2={rows}")
    exit(0 if int(rows)>0 else 1)
