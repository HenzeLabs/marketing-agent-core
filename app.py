
from flask import Flask, request, jsonify
from pipeline import run_pipeline
from google.cloud import bigquery

app = Flask(__name__)


@app.route("/api/shopify-metrics", methods=["GET"])
def shopify_metrics():
    """Return all rows from v_shopify_dashboard_metrics as JSON."""
    client = bigquery.Client(project="henzelabs-gpt")
    query = """
        SELECT *
        FROM `henzelabs-gpt.labessentials_raw.v_shopify_dashboard_metrics`
    """
    query_job = client.query(query)
    rows = [dict(row) for row in query_job]
    return jsonify(rows)


from flask import Flask, request, jsonify
from pipeline import run_pipeline
from google.cloud import bigquery

app = Flask(__name__)


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

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8080)


# --- CLARITY METRICS API ---
@app.route("/api/clarity-metrics", methods=["GET"])
def clarity_metrics():
    """Return all rows from v_clarity_pageviews as JSON."""
    client = bigquery.Client(project="henzelabs-gpt")
    query = """
        SELECT *
        FROM `henzelabs-gpt.labessentials_raw.v_clarity_pageviews`
        ORDER BY snapshot_date DESC, metricName
    """
    query_job = client.query(query)
    rows = [dict(row) for row in query_job]
    return jsonify(rows)
