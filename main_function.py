"""Cloud Function entry point for pipeline execution."""
import functions_framework
from flask import jsonify
from pipeline import run_pipeline


@functions_framework.http
def run_pipeline_entrypoint(request):
    """HTTP Cloud Function entry point.
    
    Args:
        request: Flask request object with query parameters:
            - brand: Brand name (e.g., 'labessentials', 'hotash')
            - source: Data source (e.g., 'customers', 'orders', 'ga4')
    
    Returns:
        JSON response with status
    """
    # Get parameters from query string
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