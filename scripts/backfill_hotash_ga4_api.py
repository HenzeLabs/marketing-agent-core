import os, datetime
from google.analytics.data_v1beta import BetaAnalyticsDataClient, RunReportRequest, DateRange, Metric, Dimension
from google.cloud import bigquery

PROP = os.environ.get("HOTASH_GA4_PROPERTY_ID")
if not PROP:
    raise SystemExit("Set HOTASH_GA4_PROPERTY_ID to the GA4 property id (digits only)")

DAYS = int(os.environ.get("BACKFILL_DAYS", "30"))

client = BetaAnalyticsDataClient()
bq = bigquery.Client()
project = bq.project
dataset = os.environ.get("DATASET", "hotash_raw")
table = os.environ.get("TABLE", "ga4_daily_metrics")

req = RunReportRequest(
    property=f"properties/{PROP}",
    date_ranges=[DateRange(start_date=f"{DAYS}daysAgo", end_date="today")],
    dimensions=[Dimension(name="date")],
    metrics=[Metric(name="sessions")]
)
resp = client.run_report(req)

rows = []
for r in resp.rows:
    d = datetime.datetime.strptime(r.dimension_values[0].value, "%Y%m%d").date()
    s = int(r.metric_values[0].value or 0)
    rows.append({"date": d.isoformat(), "sessions": s})

if not rows:
    print("No rows from GA4 API; exiting.")
    raise SystemExit(0)

# Insert rows using STRUCT values
values = ", ".join([f"STRUCT(DATE('{row['date']}') AS date, {row['sessions']} AS sessions)" for row in rows])
job = bq.query(f"""
MERGE `{project}.{dataset}.{table}` T
USING (
  SELECT date, sessions FROM UNNEST([{values}])
) S
ON T.date = S.date
WHEN MATCHED THEN UPDATE SET sessions = S.sessions
WHEN NOT MATCHED THEN INSERT (date, sessions) VALUES (S.date, S.sessions)
""")
job.result()
print(f"Upserted {len(rows)} rows into {project}.{dataset}.{table}")