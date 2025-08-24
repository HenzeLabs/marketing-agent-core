
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

import logging

def rows(sql, debug_label=None):
    client = get_bq()
    if not client:
        logging.error(f"[rows] No BigQuery client for {debug_label or sql}")
        return []
    try:
        job_config = bigquery.QueryJobConfig(maximum_bytes_billed=2_000_000_000)
        result = [dict(r) for r in client.query(sql, job_config=job_config).result()]
        if debug_label:
            logging.info(f"[rows] {debug_label}: {result}")
        return result
    except Exception as e:
        logging.error(f"[rows] Exception for {debug_label or sql}: {e}")
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
        SELECT date as dt, revenue_net as revenue
        FROM `henzelabs-gpt.hotash_core.v_revenue_daily_unified`
        ORDER BY date DESC LIMIT 30
    """))

@app.get("/api/metrics/sessions-daily")
def sessions_daily():
    sql = """
        SELECT date as dt, sessions
        FROM `henzelabs-gpt.hotash_core.v_ga4_sessions_daily`
        ORDER BY date DESC LIMIT 30
    """
    return jsonify(rows(sql, debug_label="sessions-daily"))

@app.get("/api/clarity/top-urls")
def clarity_top_urls():
    sql = """
        SELECT url, views
        FROM `henzelabs-gpt.hotash_core.v_clarity_top_urls`
        ORDER BY date DESC, views DESC LIMIT 20
    """
    return jsonify(rows(sql, debug_label="clarity-top-urls"))

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

# --- Admin Ingest Endpoints (token gated) ---
from flask import request
import logging

ADMIN_TOKEN = os.getenv("ADMIN_TOKEN")

def check_admin():
    token = request.headers.get("X-Admin-Token")
    if not ADMIN_TOKEN or token != ADMIN_TOKEN:
        return False
    return True

def run_ga4_pipeline():
    logging.info("GA4 ingest pipeline triggered (noop)")
    # TODO: Replace with actual row count from pipeline
    return 0

def run_clarity_pipeline():
    logging.info("Clarity ingest pipeline triggered (noop)")
    # TODO: Replace with actual row count from pipeline
    return 0

def run_shopify_pipeline():
    logging.info("Shopify ingest pipeline triggered (noop)")
    # TODO: Replace with actual row count from pipeline
    return 0

@app.post("/admin/ingest/ga4")
def admin_ingest_ga4():
    if not check_admin():
        return {"error": "Unauthorized"}, 401
    rows_written = run_ga4_pipeline()
    logging.info(f"/admin/ingest/ga4: rows_written={rows_written}")
    return {"ok": True, "rows_written": rows_written}

@app.post("/admin/ingest/clarity")
def admin_ingest_clarity():
    if not check_admin():
        return {"error": "Unauthorized"}, 401
    rows_written = run_clarity_pipeline()
    logging.info(f"/admin/ingest/clarity: rows_written={rows_written}")
    return {"ok": True, "rows_written": rows_written}

@app.post("/admin/ingest/shopify")
def admin_ingest_shopify():
    if not check_admin():
        return {"error": "Unauthorized"}, 401
    rows_written = run_shopify_pipeline()
    logging.info(f"/admin/ingest/shopify: rows_written={rows_written}")
    return {"ok": True, "rows_written": rows_written}
