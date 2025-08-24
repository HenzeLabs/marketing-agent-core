
# Clean, deduplicated Flask app
import os
from flask import Flask, jsonify

from flask_cors import CORS
from dotenv import load_dotenv
from google.cloud import bigquery

load_dotenv()
PROJECT = os.getenv("GOOGLE_CLOUD_PROJECT", "henzelabs-gpt")

app = Flask(__name__)
CORS(app)  # Dev: allow all origins
@app.get("/_health")
def _health():
    return {"ok": True}, 200

def get_bq():
    try:
        return bigquery.Client(project=PROJECT)
    except Exception:
        return None

def rows(sql):
    client = get_bq()
    if not client:
        return []
    try:
        return [dict(r) for r in client.query(sql).result()]
    except Exception:
        return []





@app.get("/")
def root():
    return jsonify({
        "ok": True,
        "routes": [
            "/api/health",
            "/api/metrics/revenue-daily",
            "/api/metrics/sessions-daily",
            "/api/clarity/top-urls",
            "/api/shopify-metrics",
            "/api/clarity-metrics",
            "/api/clarity/summaries"
        ]
    })

@app.get("/api/health")
def health():
    return jsonify({"ok": True})

@app.get("/api/metrics/revenue-daily")
def revenue_daily():
    return jsonify(rows("""
        SELECT dt, revenue
        FROM `henzelabs-gpt.hotash_core.v_ga4_revenue_daily`
        ORDER BY dt DESC LIMIT 30
    """))

@app.get("/api/metrics/sessions-daily")
def sessions_daily():
    return jsonify(rows("""
        SELECT dt, sessions
        FROM `henzelabs-gpt.hotash_core.v_ga4_sessions_daily`
        ORDER BY dt DESC LIMIT 30
    """))

@app.get("/api/clarity/top-urls")
def clarity_top_urls():
    return jsonify(rows("""
        SELECT url, SUM(pageviews) AS pv
        FROM `henzelabs-gpt.hotash_raw.clarity_pageviews`
        GROUP BY url ORDER BY pv DESC LIMIT 20
    """))

@app.get("/api/shopify-metrics")
def shopify_metrics():
    sql = """
        SELECT *
        FROM `henzelabs-gpt.labessentials_raw.v_shopify_dashboard_metrics`
    """
    return jsonify(rows(sql))

@app.get("/api/clarity-metrics")
def clarity_metrics():
    sql = """
        SELECT *
        FROM `henzelabs-gpt.labessentials_raw.v_clarity_pageviews`
        ORDER BY snapshot_date DESC, metricName
    """
    return jsonify(rows(sql))

@app.get("/api/clarity/summaries")
def get_clarity_summaries():
    sql = """
        SELECT url, snapshot_date, ai_priority, ai_summary, ai_recommendations
        FROM `henzelabs-gpt.labessentials_raw.clarity_ai_summaries`
        WHERE snapshot_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
        ORDER BY snapshot_date DESC, ai_priority ASC LIMIT 200
    """
    return jsonify(rows(sql))
