import os
import json
from datetime import datetime, timedelta, UTC
from google.cloud import bigquery, secretmanager

PROJECT_ID = "henzelabs-gpt"
DATASET = "hotash_raw"
VIEW = f"{PROJECT_ID}.{DATASET}.v_clarity_url_daily"
TABLE = f"{PROJECT_ID}.{DATASET}.clarity_ai_summaries"

def generate_ai_summary(row):
    summary = []
    recs = []
    priority = 3
    if row["rage_clicks"] > 5:
        summary.append("High user frustration detected (rage clicks). Immediate review recommended.")
        recs.append("Investigate UI/UX issues on this page.")
        priority = 1
    if row["dead_clicks"] > 5:
        summary.append("Multiple dead clicks observed.")
        recs.append("Check for broken or unresponsive elements.")
        priority = min(priority, 2)
    if row["excessive_scroll"] > 10:
        summary.append("Users are scrolling excessively.")
        recs.append("Review content structure and engagement.")
    if row["quick_backs"] > 3:
        summary.append("Quick backs indicate possible confusion.")
        recs.append("Clarify navigation or page purpose.")
    if not summary:
        summary = ["No major UX issues detected."]
        recs = ["Monitor regularly."]
    return (
        " ".join(summary)[:400],
        "; ".join(recs)[:400],
        priority
    )

def row_exists(client, url, snapshot_date):
    query = f"""
        SELECT 1 FROM `{TABLE}`
        WHERE url = @url AND snapshot_date = @snapshot_date
        LIMIT 1
    """
    job = client.query(query, job_config=bigquery.QueryJobConfig(
        query_parameters=[
            bigquery.ScalarQueryParameter("url", "STRING", url),
            bigquery.ScalarQueryParameter("snapshot_date", "DATE", snapshot_date),
        ]
    ))
    return any(job)

def main():
    client = bigquery.Client(project=PROJECT_ID)
    yesterday = (datetime.now(UTC) - timedelta(days=1)).date().isoformat()
    query = f"""
        SELECT * FROM `{VIEW}`
        WHERE snapshot_date = @yesterday
    """
    rows = list(client.query(query, job_config=bigquery.QueryJobConfig(
        query_parameters=[bigquery.ScalarQueryParameter("yesterday", "DATE", yesterday)]
    )))
    print(f"Fetched {len(rows)} rows from {VIEW} for {yesterday}")
    to_insert = []
    for row in rows:
        url = row["url"]
        snapshot_date = row["snapshot_date"]
        if row_exists(client, url, snapshot_date):
            print(f"Skipping existing: {url} {snapshot_date}")
            continue
        ai_summary, ai_recommendations, ai_priority = generate_ai_summary(row)
        to_insert.append({
            "url": url,
            "snapshot_date": snapshot_date,
            "pageviews": row["pageviews"],
            "rage_clicks": row["rage_clicks"],
            "dead_clicks": row["dead_clicks"],
            "excessive_scroll": row["excessive_scroll"],
            "quick_backs": row["quick_backs"],
            "ai_summary": ai_summary,
            "ai_recommendations": ai_recommendations,
            "ai_priority": ai_priority,
            "ingested_at": datetime.now(UTC).isoformat()
        })
    if not to_insert:
        print("No new summaries to insert.")
        return
    errors = client.insert_rows_json(TABLE, to_insert, row_ids=[f"{r['url']}|{r['snapshot_date']}" for r in to_insert])
    if errors:
        print("BigQuery insert errors:", errors)
    else:
        print(f"Inserted {len(to_insert)} summaries into {TABLE}.")
    print("Sample summary:")
    print(json.dumps(to_insert[0], indent=2))

if __name__ == "__main__":
    main()
