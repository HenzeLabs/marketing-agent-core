#!/usr/bin/env python3

import sys
import os
from datetime import datetime, timedelta
import time

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from src.load_secrets import load_env_vars_from_config
from src.shopify_pipeline import run_shopify_customers_pipeline, run_shopify_orders_pipeline

def backfill_lwscientific_batch(start_date, end_date):
    """Backfill LW Scientific data for a specific date range"""
    brand = "lwscientific"
    print(f"🔄 Backfilling {brand} from {start_date} to {end_date}")
    
    # Load secrets
    config = load_env_vars_from_config(brand)
    print(f"✅ Loaded secrets for {brand}")
    
    # Set date range in environment for pipeline
    os.environ['BACKFILL_START_DATE'] = start_date
    os.environ['BACKFILL_END_DATE'] = end_date
    
    try:
        # Run customers first (usually smaller dataset)
        print(f"📊 Running customers pipeline...")
        run_shopify_customers_pipeline(brand)
        
        # Small delay between operations
        time.sleep(2)
        
        # Run orders pipeline
        print(f"🛒 Running orders pipeline...")
        run_shopify_orders_pipeline(brand)
        
        print(f"✅ Batch {start_date} to {end_date} completed")
        return True
        
    except Exception as e:
        print(f"❌ Batch failed {start_date} to {end_date}: {e}")
        return False

def main():
    """Backfill in 30-day chunks to avoid timeouts"""
    
    # Define backfill period (adjust as needed)
    end_date = datetime.now().date()
    start_date = end_date - timedelta(days=365)  # 1 year back
    
    current_date = start_date
    batch_size = 30  # 30-day batches
    
    print(f"🚀 Starting LW Scientific backfill from {start_date} to {end_date}")
    print(f"📦 Using {batch_size}-day batches")
    
    success_count = 0
    total_batches = 0
    
    while current_date < end_date:
        batch_end = min(current_date + timedelta(days=batch_size), end_date)
        total_batches += 1
        
        if backfill_lwscientific_batch(
            current_date.strftime('%Y-%m-%d'),
            batch_end.strftime('%Y-%m-%d')
        ):
            success_count += 1
        
        current_date = batch_end + timedelta(days=1)
        
        # Small delay between batches
        time.sleep(5)
    
    print(f"🎉 Backfill complete: {success_count}/{total_batches} batches successful")

if __name__ == "__main__":
    main()