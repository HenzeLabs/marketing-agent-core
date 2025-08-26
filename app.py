# Clean, deduplicated Flask app
import os
from flask import Flask, jsonify

from flask_cors import CORS
from dotenv import load_dotenv
from google.cloud import bigquery
from datetime import date, timedelta

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

bq = bigquery.Client()
def ds(brand): return "labessentials_raw" if brand=="labessentials" else "hotash_raw"

def _clarity_columns(dataset:str) -> set:
    q = f"""
      SELECT column_name
      FROM `{bq.project}.{dataset}.INFORMATION_SCHEMA.COLUMNS`
      WHERE table_name = 'clarity_ai_summaries'
    """
    try:
        return {r["column_name"] for r in bq.query(q).result()}
    except Exception:
        return set()

@app.get("/api/clarity/hotspots")
def clarity_hotspots():
    from flask import make_response, jsonify
    brand = request.args.get("brand","labessentials")
    rng   = request.args.get("range","last_7_days")
    days  = 7
    if "14" in rng: days = 14
    if "28" in rng: days = 28
    dataset = ds(brand)
    cols = _clarity_columns(dataset)
    if not cols:
        return jsonify({"items": [], "summary": f"{brand}: no clarity_ai_summaries table"}), 200

    # Preferred fields, will pick only those that exist
    preferred = [
      "date","page_url","title","summary","sessions","avg_engagement_time",
      "rage_clicks","dead_clicks","scroll_depth","attention_score","heat_score"
    ]
    sel = [c for c in preferred if c in cols]
    if not sel:
        return jsonify({"items": [], "summary": f"{brand}: clarity_ai_summaries has no recognized columns"}), 200

    has_date = "date" in sel
    orderby  = "attention_score DESC" if "attention_score" in sel else \
               "heat_score DESC"      if "heat_score" in sel else \
               "sessions DESC"        if "sessions" in sel else \
               "avg_engagement_time DESC" if "avg_engagement_time" in sel else "1"

    where = f"WHERE date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL {days} DAY) AND CURRENT_DATE()" if has_date else ""
    select_list = ", ".join(sel)
    q = f"""
      SELECT {select_list}
      FROM `{bq.project}.{dataset}.clarity_ai_summaries`
      {where}
      ORDER BY {orderby}
      LIMIT 20
    """
    job = bq.query(q)
    rows = [dict(r) for r in job.result(timeout=15)]

    payload = {"items": rows, "summary": f"{brand}: {len(rows)} hotspots (last {days} days)"}
    resp = make_response(jsonify(payload))
    resp.headers["Cache-Control"] = "public, max-age=600"  # 10 min cache
    return resp

@app.get("/api/metrics/revenue")
def revenue():
    brand = request.args.get("brand","labessentials")
    rng   = request.args.get("range","last_30_days")
    days  = 30
    if "7" in rng: days = 7
    if "14" in rng: days = 14
    if "28" in rng: days = 28
    q = f"""
      WITH win AS (
        SELECT DATE_SUB(CURRENT_DATE(), INTERVAL {days} DAY) AS d0, CURRENT_DATE() AS d1
      )
      SELECT
        SUM(CAST(total_price AS FLOAT64)) AS total_revenue,
        COUNT(*)         AS orders_count
      FROM `{bq.project}.{ds(brand)}.shopify_orders`, win
      WHERE DATE(created_at) BETWEEN win.d0 AND win.d1
        AND cancelled_at IS NULL
    """
    job = bq.query(q)
    rows = [dict(r) for r in job.result(timeout=15)]
    total = float(rows[0]["total_revenue"] or 0) if rows else 0.0
    orders= int(rows[0]["orders_count"] or 0)     if rows else 0
    aov   = (total / orders) if orders else 0.0
    from flask import make_response, jsonify
    payload = {"total": total, "orders": orders, "aov": aov, "range_days": days, "brand": brand}
    resp = make_response(jsonify(payload))
    resp.headers["Cache-Control"] = "public, max-age=300"
    return resp



@app.get("/api/metrics/ga4-daily")
def ga4_daily():
    brand=request.args.get("brand","labessentials")
    days=28 if "28" in request.args.get("range","") else 30
    # Cache for 5 minutes to keep the endpoint snappy
    from flask import make_response
    q = f"""
      SELECT date, sessions, total_users, engaged_sessions, bounce_rate
      FROM `{bq.project}.{ds(brand)}.ga4_daily_metrics`
      WHERE date BETWEEN DATE_SUB(CURRENT_DATE(), INTERVAL {days} DAY) AND CURRENT_DATE()
      ORDER BY date
    """
    job = bq.query(q, job_config=bigquery.QueryJobConfig())
    rows = [dict(r) for r in job.result(timeout=15)]
    payload = {"series":[{"date":str(r["date"]), "value":r["sessions"]} for r in rows],
               "summary": f"{brand}: {len(rows)} days"}
    resp = make_response(jsonify(payload))
    resp.headers["Cache-Control"] = "public, max-age=300"
    return resp

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