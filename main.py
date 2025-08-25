
import functions_framework
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


@functions_framework.http
def run_pipeline_entrypoint(request):
    """HTTP Cloud Function entry point.
    
    Args:
        request: Flask request object with query parameters or JSON body:
            - brand: Brand name (e.g., 'labessentials', 'hotash')
            - source: Data source (e.g., 'shopify', 'ga4', 'shopify_customers')
    
    Returns:
        JSON response with status
    """
    # Try to get parameters from JSON body first, then query string
    if request.is_json:
        data = request.get_json()
        brand = data.get('brand')
        source = data.get('source')
    else:
        brand = request.args.get('brand')
        source = request.args.get('source')
    
    # Validate parameters
    if not brand:
        return jsonify({"error": "Missing 'brand' parameter"}), 400
    if not source:
        return jsonify({"error": "Missing 'source' parameter"}), 400
    
    # Execute pipeline
    try:
        run_pipeline(brand, source)
        return jsonify({
            "brand": brand,
            "source": source,
            "status": "success"
        }), 200
    except Exception as e:
        return jsonify({
            "brand": brand,
            "source": source,
            "status": "error",
            "error": str(e)
        }), 500


if __name__ == "__main__":
    app.run(debug=True)
