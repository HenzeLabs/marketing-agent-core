
def run_pipeline(brand, source):
    from src.load_secrets import load_env_vars_from_config
    from src.shopify_pipeline import run_shopify_customers_pipeline
    from shared.logging import setup_logging
    from google.cloud import logging as cloud_logging
    logger = setup_logging()
    config = load_env_vars_from_config(brand)
    logger.info(f"Loaded config keys: {list(config.get('brands', {}).keys())}")

    # Cloud Logging setup
    cloud_logging_client = cloud_logging.Client()
    cloud_logger = cloud_logging_client.logger("pipeline_failures")

    from shared.bigquery import insert_rows_into_table
    from datetime import datetime
    log_table = "henzelabs-gpt.analytics.pipeline_logs"
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "brand": brand,
        "source": source,
        "status": None,
        "message": None
    }
    try:
        if source == "shopify_customers":
            run_shopify_customers_pipeline()
            log_entry["status"] = "success"
            log_entry["message"] = "shopify_customers pipeline completed successfully"
            cloud_logger.log_struct({**log_entry, "service": "marketing-agent-core"}, severity="INFO")
        elif source == "shopify_orders":
            try:
                from src.shopify_pipeline import run_shopify_orders_pipeline
            except ImportError:
                logger.error("run_shopify_orders_pipeline is not implemented.")
                log_entry["status"] = "error"
                log_entry["message"] = "run_shopify_orders_pipeline is not implemented."
                cloud_logger.log_struct({**log_entry, "service": "marketing-agent-core"}, severity="ERROR")
                response = insert_rows_into_table(log_table, [log_entry])
                print("Log insert response:", response)
                raise NotImplementedError("run_shopify_orders_pipeline is not implemented.")
            run_shopify_orders_pipeline()
            log_entry["status"] = "success"
            log_entry["message"] = "shopify_orders pipeline completed successfully"
            cloud_logger.log_struct({**log_entry, "service": "marketing-agent-core"}, severity="INFO")
        else:
            logger.error(f"Unsupported source: {source}")
            log_entry["status"] = "error"
            log_entry["message"] = f"Unsupported source: {source}"
            cloud_logger.log_struct({**log_entry, "service": "marketing-agent-core"}, severity="ERROR")
            response = insert_rows_into_table(log_table, [log_entry])
            print("Log insert response:", response)
            raise ValueError(f"Unsupported source: {source}")
    except Exception as e:
        log_entry["status"] = "error"
        log_entry["message"] = str(e)
        cloud_logger.log_struct({**log_entry, "service": "marketing-agent-core"}, severity="ERROR")
        response = insert_rows_into_table(log_table, [log_entry])
        print("Log insert response:", response)
        raise
    response = insert_rows_into_table(log_table, [log_entry])
    cloud_logger.log_struct({**log_entry, "service": "marketing-agent-core"}, severity="INFO" if log_entry["status"] == "success" else "ERROR")
    print("Log insert response:", response)


import argparse
import os
from src.load_secrets import load_env_vars_from_config
from src.shopify_pipeline import run_shopify_customers_pipeline
from shared.logging import setup_logging


def main():
    parser = argparse.ArgumentParser(description="Marketing Data Pipeline")
    parser.add_argument("--brand", required=True, help="Brand name (e.g., labessentials)")
    # Optionally allow config/source override for CLI
    parser.add_argument("--config", default="config.yaml", help="Path to config file")
    parser.add_argument("--source", default="shopify_customers", help="Data source to ingest (e.g., shopify_customers)")
    args = parser.parse_args()

    # Set config path if needed
    if args.config:
        os.environ["CONFIG_PATH"] = args.config
    # Use CLI source if provided
    run_pipeline(args.brand, args.source)

if __name__ == "__main__":
    main()
