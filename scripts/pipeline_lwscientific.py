#!/usr/bin/env python3

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.load_secrets import load_env_vars_from_config
from src.shopify_pipeline import run_shopify_customers_pipeline, run_shopify_orders_pipeline

def main():
    brand = "lwscientific"
    print(f"🚀 Starting LW Scientific Pipeline")
    
    # Load secrets into environment variables
    config = load_env_vars_from_config(brand)
    print(f"✅ Loaded secrets for {brand}")
    
    # Run Shopify pipelines
    try:
        run_shopify_customers_pipeline(brand)
        run_shopify_orders_pipeline(brand)
        print(f"✅ LW Scientific pipeline completed successfully")
    except Exception as e:
        print(f"❌ Pipeline failed: {e}")
        raise

if __name__ == "__main__":
    main()