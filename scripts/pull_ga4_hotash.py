from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import RunReportRequest, DateRange, Dimension, Metric
from google.oauth2 import service_account
import os
import json
import datetime
from google.cloud import bigquery
from src.load_secrets import load_env_vars_from_config


def run_ga4_ingestion():
    # Load secrets and get property_id
    load_env_vars_from_config(brand="hotash")
    property_id = os.environ.get("HOTASH_GA4_PROPERTY_ID")
    if not property_id:
        raise ValueError("HOTASH_GA4_PROPERTY_ID secret not found in environment variables.")

    # Load credentials
    credentials = service_account.Credentials.from_service_account_file(
        "hotash_service_account.json"
    )
    
    client = BetaAnalyticsDataClient(credentials=credentials)

    request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="date")],
        metrics=[
            Metric(name="sessions"),
            Metric(name="totalUsers"),
            Metric(name="newUsers"),
            Metric(name="engagedSessions"),
            Metric(name="averageSessionDuration"),
            Metric(name="bounceRate"),
        ],
        date_ranges=[DateRange(start_date="7daysAgo", end_date="today")],
    )

    response = client.run_report(request)

    print(f"Received {len(response.rows)} rows from GA4 API.")

    if not response.rows:
        print("No new data from GA4 API. Exiting.")
        return

    rows = []
    for row in response.rows:
        rows.append({
            "date": datetime.datetime.strptime(row.dimension_values[0].value, "%Y%m%d").strftime("%Y-%m-%d"),
            "sessions": int(row.metric_values[0].value),
            "total_users": int(row.metric_values[1].value),
            "new_users": int(row.metric_values[2].value),
            "engaged_sessions": int(row.metric_values[3].value),
            "avg_session_duration_seconds": float(row.metric_values[4].value),
            "bounce_rate": float(row.metric_values[5].value),
        })

    # Convert rows to JSON string
    rows_json = json.dumps(rows)

    # Upload to BigQuery using MERGE statement with JSON parsing
    bq_client = bigquery.Client()
    table_id = "henzelabs-gpt.hotash_raw.ga4_daily_metrics"

    # Prepare the MERGE statement
    # The @rows_json parameter will be a JSON string representing an array of structs
    query = f"""
    MERGE `{table_id}` T
    USING (
        SELECT
            PARSE_DATE('%Y-%m-%d', JSON_VALUE(json_row, '$.date')) AS date,
            CAST(JSON_VALUE(json_row, '$.sessions') AS INT64) AS sessions,
            CAST(JSON_VALUE(json_row, '$.total_users') AS INT64) AS total_users,
            CAST(JSON_VALUE(json_row, '$.new_users') AS INT64) AS new_users,
            CAST(JSON_VALUE(json_row, '$.engaged_sessions') AS INT64) AS engaged_sessions,
            CAST(JSON_VALUE(json_row, '$.avg_session_duration_seconds') AS FLOAT64) AS avg_session_duration_seconds,
            CAST(JSON_VALUE(json_row, '$.bounce_rate') AS FLOAT64) AS bounce_rate
        FROM
            UNNEST(JSON_QUERY_ARRAY(@rows_json)) AS json_row
    ) S
    ON T.date = S.date
    WHEN MATCHED THEN UPDATE SET
      sessions=S.sessions, total_users=S.total_users, new_users=S.new_users,
      engaged_sessions=S.engaged_sessions,
      avg_session_duration_seconds=S.avg_session_duration_seconds,
      bounce_rate=S.bounce_rate
    WHEN NOT MATCHED THEN INSERT ROW
    """

    job_config = bigquery.QueryJobConfig(query_parameters=[
        bigquery.ScalarQueryParameter("rows_json", "STRING", rows_json)
    ])

    try:
        query_job = bq_client.query(query, job_config=job_config)
        query_job.result()  # Waits for the job to complete.
        print("GA4 data merged successfully.")
    except Exception as e:
        print(f"Error merging GA4 data: {e}")
        raise Exception("BigQuery merge failed.")

if __name__ == "__main__":
    run_ga4_ingestion()