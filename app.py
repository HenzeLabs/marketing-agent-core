from flask import Flask, request, jsonify
from pipeline import run_pipeline
from google.cloud import bigquery

app = Flask(__name__)

# --- ROOT PIPELINE TRIGGER ---
@app.route("/", methods=["GET"])
def trigger():
    brand = request.args.get("brand")
    source = request.args.get("source")
    if not brand or not source:
        return jsonify({"error": "Missing brand or source parameter"}), 400
    try:
        run_pipeline(brand, source)
        return jsonify({"status": "Pipeline executed successfully"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


# --- SHOPIFY METRICS API ---
@app.route("/api/shopify-metrics", methods=["GET"])
def shopify_metrics():
    client = bigquery.Client(project="henzelabs-gpt")
    query = """
        SELECT *
        FROM `henzelabs-gpt.labessentials_raw.v_shopify_dashboard_metrics`
    """
    rows = [dict(row) for row in client.query(query)]
    return jsonify(rows)


# --- CLARITY METRICS API ---
@app.route("/api/clarity-metrics", methods=["GET"])
def clarity_metrics():
    client = bigquery.Client(project="henzelabs-gpt")
    query = """
        SELECT *
        FROM `henzelabs-gpt.labessentials_raw.v_clarity_pageviews`
        ORDER BY snapshot_date DESC, metricName
    """
    rows = [dict(row) for row in client.query(query)]
    return jsonify(rows)


# --- CLARITY AI SUMMARIES API ---
@app.route("/api/clarity/summaries", methods=["GET"])
def get_clarity_summaries():
    client = bigquery.Client(project="henzelabs-gpt")
    sql = """
        SELECT url, snapshot_date, ai_priority, ai_summary, ai_recommendations
        FROM `henzelabs-gpt.labessentials_raw.clarity_ai_summaries`
        WHERE snapshot_date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)
        ORDER BY snapshot_date DESC, ai_priority ASC LIMIT 200
    """
    rows = [dict(row) for row in client.query(sql)]
    return jsonify(rows)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5050)
