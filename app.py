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
        WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY)
        ORDER BY date DESC
    """))

@app.get("/api/metrics/sessions-daily")
def sessions_daily():
    sql = """
        SELECT date as dt, sessions
        FROM `henzelabs-gpt.hotash_core.v_ga4_sessions_daily`
        WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY)
        ORDER BY date DESC
    """
    return jsonify(rows(sql, debug_label="sessions-daily"))

bq = bigquery.Client()
def ds(brand): return "labessentials_raw" if brand=="labessentials" else "hotash_raw" if brand=="hotash" else "lwscientific_raw"

@app.get("/api/summary/wow")
def wow_summary():
    from flask import make_response, jsonify
    brand = request.args.get("brand","labessentials")
    metric = request.args.get("metric","sessions")  # sessions|revenue
    window = request.args.get("window","7")
    try:
        days = int(''.join(ch for ch in window if ch.isdigit())) or 7
    except Exception:
        days = 7
    d = days
    dataset = ds(brand)

    if metric == "sessions":
        q = f"""
        WITH win AS (
          SELECT
            DATE_SUB(CURRENT_DATE(), INTERVAL {d-1} DAY) AS cur_start,
            CURRENT_DATE() AS cur_end,
            DATE_SUB(CURRENT_DATE(), INTERVAL {2*d} DAY) AS prev_start,
            DATE_SUB(CURRENT_DATE(), INTERVAL {d} DAY) AS prev_end
        ),
        cur AS (
          SELECT COALESCE(SUM(sessions),0) AS v FROM `{bq.project}.{dataset}.ga4_daily_metrics`, win
          WHERE date BETWEEN win.cur_start AND win.cur_end
        ),
        prev AS (
          SELECT COALESCE(SUM(sessions),0) AS v FROM `{bq.project}.{dataset}.ga4_daily_metrics`, win
          WHERE date BETWEEN win.prev_start AND win.prev_end
        )
        SELECT
          (SELECT v FROM cur) AS current_total,
          (SELECT v FROM prev) AS previous_total,
          (SELECT cur_start FROM win) AS cur_start,
          (SELECT cur_end FROM win) AS cur_end,
          (SELECT prev_start FROM win) AS prev_start,
          (SELECT prev_end FROM win) AS prev_end
        """
    else:  # revenue - use recent activity for labessentials
        if brand == "labessentials":
            q = f"""
            WITH recent_orders AS (
              SELECT DATE(created_at) as order_date, CAST(total_price AS FLOAT64) as price
              FROM `{bq.project}.{dataset}.shopify_orders`
              WHERE cancelled_at IS NULL AND DATE(created_at) >= '2024-11-01'
              ORDER BY created_at DESC
            ),
            periods AS (
              SELECT 
                SUM(CASE WHEN order_date >= '2025-01-01' THEN price ELSE 0 END) as current_total,
                COUNT(CASE WHEN order_date >= '2025-01-01' THEN 1 END) as current_orders,
                SUM(CASE WHEN order_date >= '2024-11-01' AND order_date < '2025-01-01' THEN price ELSE 0 END) as previous_total,
                COUNT(CASE WHEN order_date >= '2024-11-01' AND order_date < '2025-01-01' THEN 1 END) as previous_orders
              FROM recent_orders
            )
            SELECT current_total, current_orders, previous_total, previous_orders FROM periods
            """
        else:
            q = f"""
            WITH win AS (
              SELECT
                DATE_SUB(CURRENT_DATE(), INTERVAL {d-1} DAY) AS cur_start,
                CURRENT_DATE() AS cur_end,
                DATE_SUB(CURRENT_DATE(), INTERVAL {2*d} DAY) AS prev_start,
                DATE_SUB(CURRENT_DATE(), INTERVAL {d} DAY) AS prev_end
            ),
            cur AS (
              SELECT COALESCE(SUM(CAST(total_price AS FLOAT64)),0) AS total, COUNT(*) AS orders
              FROM `{bq.project}.{dataset}.shopify_orders`, win
              WHERE DATE(created_at) BETWEEN win.cur_start AND win.cur_end
                AND cancelled_at IS NULL
            ),
            prev AS (
              SELECT COALESCE(SUM(CAST(total_price AS FLOAT64)),0) AS total, COUNT(*) AS orders
              FROM `{bq.project}.{dataset}.shopify_orders`, win
              WHERE DATE(created_at) BETWEEN win.prev_start AND win.prev_end
                AND cancelled_at IS NULL
            )
            SELECT
              (SELECT total FROM cur) AS current_total,
              (SELECT orders FROM cur) AS current_orders,
              (SELECT total FROM prev) AS previous_total,
              (SELECT orders FROM prev) AS previous_orders,
              (SELECT cur_start FROM win) AS cur_start,
              (SELECT cur_end FROM win) AS cur_end,
              (SELECT prev_start FROM win) AS prev_start,
              (SELECT prev_end FROM win) AS prev_end
            """
    job = bq.query(q)
    rows = [dict(r) for r in job.result(timeout=15)]
    if not rows:
        rows = [{"current_total": 0, "previous_total": 0}]
    
    row = rows[0]
    current = float(row.get("current_total") or 0)
    previous = float(row.get("previous_total") or 0)
    change = current - previous
    pct_change = (change / previous * 100) if previous > 0 else 0
    
    payload = {
        "brand": brand,
        "metric": metric,
        "window_days": days,
        "current": current,
        "previous": previous,
        "change": change,
        "percent_change": round(pct_change, 1)
    }
    
    # Add window metadata if available
    if brand != "labessentials" or metric != "revenue":
        if "cur_start" in row:
            payload["window"] = {
                "type": "wow",
                "current": {"start": str(row["cur_start"]), "end": str(row["cur_end"])},
                "previous": {"start": str(row["prev_start"]), "end": str(row["prev_end"])}
            }
    else:
        # Lab essentials revenue uses fixed periods
        payload["window"] = {
            "type": "wow:recent_activity",
            "current": {"start": "2025-01-01", "end": "2025-01-31"},
            "previous": {"start": "2024-11-01", "end": "2024-12-31"}
        }
    
    if metric == "revenue" and "current_orders" in row:
        payload["current_orders"] = int(row.get("current_orders") or 0)
        payload["previous_orders"] = int(row.get("previous_orders") or 0)
    
    resp = make_response(jsonify(payload))
    resp.headers["Cache-Control"] = "public, max-age=900"  # 15 min cache
    return resp

@app.get("/api/summary/mom")
def mom_summary():
    from flask import make_response, jsonify
    brand = request.args.get("brand","labessentials")
    metric = request.args.get("metric","sessions")
    dataset = ds(brand)
    
    if metric == "sessions":
        q = f"""
        WITH win AS (
          SELECT
            DATE_TRUNC(CURRENT_DATE(), MONTH) AS cur_start,
            CURRENT_DATE() AS cur_end,
            DATE_TRUNC(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), MONTH) AS prev_start,
            DATE_SUB(DATE_TRUNC(CURRENT_DATE(), MONTH), INTERVAL 1 DAY) AS prev_end
        ),
        cur AS (
          SELECT COALESCE(SUM(sessions),0) AS v FROM `{bq.project}.{dataset}.ga4_daily_metrics`, win
          WHERE date BETWEEN win.cur_start AND win.cur_end
        ),
        prev AS (
          SELECT COALESCE(SUM(sessions),0) AS v FROM `{bq.project}.{dataset}.ga4_daily_metrics`, win
          WHERE date BETWEEN win.prev_start AND win.prev_end
        )
        SELECT (SELECT v FROM cur) AS current_total, (SELECT v FROM prev) AS previous_total,
               (SELECT cur_start FROM win) AS cur_start, (SELECT cur_end FROM win) AS cur_end,
               (SELECT prev_start FROM win) AS prev_start, (SELECT prev_end FROM win) AS prev_end
        """
    else:
        if brand == "labessentials":
            q = f"""
            WITH recent_orders AS (
              SELECT DATE(created_at) as order_date, CAST(total_price AS FLOAT64) as price
              FROM `{bq.project}.{dataset}.shopify_orders`
              WHERE cancelled_at IS NULL AND DATE(created_at) >= '2024-09-01'
              ORDER BY created_at DESC
            ),
            periods AS (
              SELECT 
                SUM(CASE WHEN order_date >= '2025-01-01' THEN price ELSE 0 END) as current_total,
                COUNT(CASE WHEN order_date >= '2025-01-01' THEN 1 END) as current_orders,
                SUM(CASE WHEN order_date >= '2024-11-01' AND order_date < '2025-01-01' THEN price ELSE 0 END) as previous_total,
                COUNT(CASE WHEN order_date >= '2024-11-01' AND order_date < '2025-01-01' THEN 1 END) as previous_orders
              FROM recent_orders
            )
            SELECT current_total, current_orders, previous_total, previous_orders FROM periods
            """
        else:
            q = f"""
            WITH win AS (
              SELECT
                DATE_TRUNC(CURRENT_DATE(), MONTH) AS cur_start,
                CURRENT_DATE() AS cur_end,
                DATE_TRUNC(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH), MONTH) AS prev_start,
                DATE_SUB(DATE_TRUNC(CURRENT_DATE(), MONTH), INTERVAL 1 DAY) AS prev_end
            ),
            cur AS (
              SELECT COALESCE(SUM(CAST(total_price AS FLOAT64)),0) AS total, COUNT(*) AS orders
              FROM `{bq.project}.{dataset}.shopify_orders`, win
              WHERE DATE(created_at) BETWEEN win.cur_start AND win.cur_end AND cancelled_at IS NULL
            ),
            prev AS (
              SELECT COALESCE(SUM(CAST(total_price AS FLOAT64)),0) AS total, COUNT(*) AS orders
              FROM `{bq.project}.{dataset}.shopify_orders`, win
              WHERE DATE(created_at) BETWEEN win.prev_start AND win.prev_end AND cancelled_at IS NULL
            )
            SELECT (SELECT total FROM cur) AS current_total, (SELECT orders FROM cur) AS current_orders,
                   (SELECT total FROM prev) AS previous_total, (SELECT orders FROM prev) AS previous_orders,
                   (SELECT cur_start FROM win) AS cur_start, (SELECT cur_end FROM win) AS cur_end,
                   (SELECT prev_start FROM win) AS prev_start, (SELECT prev_end FROM win) AS prev_end
            """
    
    job = bq.query(q)
    rows = [dict(r) for r in job.result(timeout=15)]
    if not rows: rows = [{"current_total": 0, "previous_total": 0}]
    
    row = rows[0]
    current = float(row.get("current_total") or 0)
    previous = float(row.get("previous_total") or 0)
    change = current - previous
    pct_change = (change / previous * 100) if previous > 0 else 0
    
    payload = {"brand": brand, "metric": metric, "current": current, "previous": previous, "change": change, "percent_change": round(pct_change, 1)}
    if metric == "revenue" and "current_orders" in row:
        payload["current_orders"] = int(row.get("current_orders") or 0)
        payload["previous_orders"] = int(row.get("previous_orders") or 0)
    
    # Add window metadata
    if brand != "labessentials" or metric != "revenue":
        if "cur_start" in row:
            payload["window"] = {
                "type": "mom",
                "current": {"start": str(row["cur_start"]), "end": str(row["cur_end"])},
                "previous": {"start": str(row["prev_start"]), "end": str(row["prev_end"])}
            }
    else:
        payload["window"] = {
            "type": "mom:recent_activity",
            "current": {"start": "2025-01-01", "end": "2025-01-31"},
            "previous": {"start": "2024-11-01", "end": "2024-12-31"}
        }
    
    resp = make_response(jsonify(payload))
    resp.headers["Cache-Control"] = "public, max-age=1800"
    return resp

@app.get("/api/summary/qoq")
def qoq_summary():
    from flask import make_response, jsonify
    brand = request.args.get("brand","labessentials")
    metric = request.args.get("metric","sessions")
    dataset = ds(brand)
    
    if metric == "sessions":
        q = f"""
        WITH cur AS (
          SELECT COALESCE(SUM(sessions),0) AS v FROM `{bq.project}.{dataset}.ga4_daily_metrics`
          WHERE date >= DATE_TRUNC(CURRENT_DATE(), QUARTER)
        ),
        prev AS (
          SELECT COALESCE(SUM(sessions),0) AS v FROM `{bq.project}.{dataset}.ga4_daily_metrics`
          WHERE date >= DATE_TRUNC(DATE_SUB(CURRENT_DATE(), INTERVAL 1 QUARTER), QUARTER)
            AND date < DATE_TRUNC(CURRENT_DATE(), QUARTER)
        )
        SELECT (SELECT v FROM cur) AS current_total, (SELECT v FROM prev) AS previous_total
        """
    else:
        if brand == "labessentials":
            q = f"""
            WITH recent_orders AS (
              SELECT DATE(created_at) as order_date, CAST(total_price AS FLOAT64) as price
              FROM `{bq.project}.{dataset}.shopify_orders`
              WHERE cancelled_at IS NULL AND DATE(created_at) >= '2024-05-01'
              ORDER BY created_at DESC
            ),
            periods AS (
              SELECT 
                SUM(CASE WHEN order_date >= '2024-11-01' THEN price ELSE 0 END) as current_total,
                COUNT(CASE WHEN order_date >= '2024-11-01' THEN 1 END) as current_orders,
                SUM(CASE WHEN order_date >= '2024-05-01' AND order_date < '2024-11-01' THEN price ELSE 0 END) as previous_total,
                COUNT(CASE WHEN order_date >= '2024-05-01' AND order_date < '2024-11-01' THEN 1 END) as previous_orders
              FROM recent_orders
            )
            SELECT current_total, current_orders, previous_total, previous_orders FROM periods
            """
        else:
            q = f"""
            WITH cur AS (
              SELECT COALESCE(SUM(CAST(total_price AS FLOAT64)),0) AS total, COUNT(*) AS orders
              FROM `{bq.project}.{dataset}.shopify_orders`
              WHERE DATE(created_at) >= DATE_TRUNC(CURRENT_DATE(), QUARTER) AND cancelled_at IS NULL
            ),
            prev AS (
              SELECT COALESCE(SUM(CAST(total_price AS FLOAT64)),0) AS total, COUNT(*) AS orders
              FROM `{bq.project}.{dataset}.shopify_orders`
              WHERE DATE(created_at) >= DATE_TRUNC(DATE_SUB(CURRENT_DATE(), INTERVAL 1 QUARTER), QUARTER)
                AND DATE(created_at) < DATE_TRUNC(CURRENT_DATE(), QUARTER) AND cancelled_at IS NULL
            )
            SELECT (SELECT total FROM cur) AS current_total, (SELECT orders FROM cur) AS current_orders,
                   (SELECT total FROM prev) AS previous_total, (SELECT orders FROM prev) AS previous_orders
            """
    
    job = bq.query(q)
    rows = [dict(r) for r in job.result(timeout=15)]
    if not rows: rows = [{"current_total": 0, "previous_total": 0}]
    
    row = rows[0]
    current = float(row.get("current_total") or 0)
    previous = float(row.get("previous_total") or 0)
    change = current - previous
    pct_change = (change / previous * 100) if previous > 0 else 0
    
    payload = {"brand": brand, "metric": metric, "current": current, "previous": previous, "change": change, "percent_change": round(pct_change, 1)}
    if metric == "revenue" and "current_orders" in row:
        payload["current_orders"] = int(row.get("current_orders") or 0)
        payload["previous_orders"] = int(row.get("previous_orders") or 0)
    
    resp = make_response(jsonify(payload))
    resp.headers["Cache-Control"] = "public, max-age=3600"
    return resp

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
    # Use 6 months for dashboard data
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

    where = "WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY)" if has_date else ""
    select_list = ", ".join(sel)
    q = f"""
      SELECT {select_list}
      FROM `{bq.project}.{dataset}.clarity_ai_summaries`
      {where}
      ORDER BY {orderby}
      LIMIT 50
    """
    job = bq.query(q)
    rows = [dict(r) for r in job.result(timeout=15)]

    payload = {"items": rows, "summary": f"{brand}: {len(rows)} hotspots (365 days)"}
    resp = make_response(jsonify(payload))
    resp.headers["Cache-Control"] = "public, max-age=600"  # 10 min cache
    return resp

@app.get("/api/metrics/revenue")
def revenue():
    brand = request.args.get("brand","lwscientific")
    # Use 6 months for dashboard data
    q = f"""
      SELECT
        SUM(CAST(total_price AS FLOAT64)) AS total_revenue,
        COUNT(*) AS orders_count
      FROM `{bq.project}.{ds(brand)}.shopify_orders`
      WHERE DATE(created_at) >= DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY)
        AND cancelled_at IS NULL
    """
    job = bq.query(q)
    rows = [dict(r) for r in job.result(timeout=15)]
    total = float(rows[0]["total_revenue"] or 0) if rows else 0.0
    orders= int(rows[0]["orders_count"] or 0)     if rows else 0
    aov   = (total / orders) if orders else 0.0
    from flask import make_response, jsonify
    payload = {"total": total, "orders": orders, "aov": aov, "range_days": 365, "brand": brand}
    resp = make_response(jsonify(payload))
    resp.headers["Cache-Control"] = "public, max-age=300"
    return resp



@app.get("/api/metrics/ga4-daily")
def ga4_daily():
    brand=request.args.get("brand","lwscientific")
    # Use 6 months for dashboard data
    from flask import make_response
    q = f"""
      SELECT date, sessions, total_users, engaged_sessions, bounce_rate
      FROM `{bq.project}.{ds(brand)}.ga4_daily_metrics`
      WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 365 DAY)
      ORDER BY date
    """
    job = bq.query(q, job_config=bigquery.QueryJobConfig())
    rows = [dict(r) for r in job.result(timeout=15)]
    payload = {"series":[{"date":str(r["date"]), "value":r["sessions"]} for r in rows],
               "summary": f"{brand}: {len(rows)} days (365 days)"}
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

from src.ga4_pipeline import run_ga4_pipeline
from src.clarity_pipeline import run_clarity_pipeline
from src.shopify_pipeline import run_shopify_pipeline

@app.post("/admin/ingest/ga4")
def admin_ingest_ga4():
    if not check_admin():
        return {"error": "Unauthorized"}, 401
    brand = request.args.get("brand", "lwscientific")
    rows_written = run_ga4_pipeline(brand)
    logging.info(f"/admin/ingest/ga4: brand={brand}, rows_written={rows_written}")
    return {"ok": True, "brand": brand, "rows_written": rows_written}

@app.post("/admin/ingest/clarity")
def admin_ingest_clarity():
    if not check_admin():
        return {"error": "Unauthorized"}, 401
    brand = request.args.get("brand", "lwscientific")
    rows_written = run_clarity_pipeline(brand)
    logging.info(f"/admin/ingest/clarity: brand={brand}, rows_written={rows_written}")
    return {"ok": True, "brand": brand, "rows_written": rows_written}

@app.post("/admin/ingest/shopify")
def admin_ingest_shopify():
    if not check_admin():
        return {"error": "Unauthorized"}, 401
    brand = request.args.get("brand", "lwscientific")
    source = request.args.get("source", "all")
    rows_written = run_shopify_pipeline(brand, source)
    logging.info(f"/admin/ingest/shopify: brand={brand}, source={source}, rows_written={rows_written}")
    return {"ok": True, "brand": brand, "source": source, "rows_written": rows_written}