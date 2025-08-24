from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import RunReportRequest, DateRange, Dimension, Metric
from google.oauth2 import service_account
import os
import json
from google.cloud import bigquery

def run_ga4_ingestion():
    # Load credentials
    credentials = service_account.Credentials.from_service_account_file(
        "hotash_service_account.json"
    )
    
    property_id = "319024536"
    client = BetaAnalyticsDataClient(credentials=credentials)

    request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="date")],
        metrics=[
            Metric(name="sessions"),
            Metric(name="totalUsers"),
            Metric(name="bounceRate"),
        ],
        date_ranges=[DateRange(start_date="7daysAgo", end_date="today")],
    )

    response = client.run_report(request)

    rows = []
    for row in response.rows:
        rows.append({
            "date": row.dimension_values[0].value,
            "sessions": int(row.metric_values[0].value),
            "total_users": int(row.metric_values[1].value),
            "bounce_rate": float(row.metric_values[2].value),
        })

    # Upload to BigQuery
    bq_client = bigquery.Client()
    table_id = "henzelabs-gpt.hotash_raw.ga4_events"
    errors = bq_client.insert_rows_json(table_id, rows)
    if errors:
        print("Upload errors:", errors)
    else:
        print("GA4 data uploaded successfully")

if __name__ == "__main__":
    run_ga4_ingestion()
