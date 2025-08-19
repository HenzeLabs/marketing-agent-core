

from flask import Flask, request, jsonify
from pipeline import run_pipeline

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
