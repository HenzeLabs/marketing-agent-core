#!/usr/bin/env python3
"""Health check script for marketing data pipelines.

Monitors data freshness for both Lab Essentials and Hot Ash brands.
Exits with non-zero code if any table is stale.
"""
import sys
import json
import subprocess
from datetime import datetime, timedelta
from typing import Dict, List, Tuple


def run_command(cmd) -> str:
    """Execute shell command and return output."""
    if isinstance(cmd, list):
        result = subprocess.run(cmd, capture_output=True, text=True)
    else:
        result = subprocess.run(cmd, shell=True, capture_output=True, text=True)
    if result.returncode != 0:
        print(f"Error running command: {cmd}")
        print(f"stderr: {result.stderr}")
        return ""
    return result.stdout.strip()


def check_table_freshness(brand: str, max_age_hours: int = 24) -> Tuple[bool, List[Dict]]:
    """Check BigQuery table freshness for a brand.
    
    Args:
        brand: Brand name ('labessentials' or 'hotash')
        max_age_hours: Maximum acceptable age in hours
        
    Returns:
        Tuple of (is_healthy, list of table info)
    """
    dataset = f"{brand}_raw"
    query = f"""SELECT 
        table_id,
        TIMESTAMP_MILLIS(last_modified_time) AS last_modified,
        TIMESTAMP_DIFF(CURRENT_TIMESTAMP(), TIMESTAMP_MILLIS(last_modified_time), HOUR) AS hours_old
    FROM `henzelabs-gpt.{dataset}.__TABLES__`
    ORDER BY last_modified DESC"""
    
    # Use list format to avoid shell escaping issues
    cmd = ['bq', 'query', '--use_legacy_sql=false', '--format=json', query]
    output = run_command(cmd)
    
    if not output:
        return False, []
    
    try:
        tables = json.loads(output)
    except json.JSONDecodeError:
        print(f"Failed to parse BigQuery response for {brand}")
        return False, []
    
    is_healthy = True
    for table in tables:
        if table['hours_old'] and int(table['hours_old']) > max_age_hours:
            is_healthy = False
            table['is_stale'] = True
        else:
            table['is_stale'] = False
    
    return is_healthy, tables


def trigger_pipeline(brand: str, source: str) -> bool:
    """Trigger pipeline via Cloud Function.
    
    Args:
        brand: Brand name
        source: Data source (e.g., 'shopify', 'shopify_customers', 'ga4')
        
    Returns:
        True if successful, False otherwise
    """
    url = "https://us-central1-henzelabs-gpt.cloudfunctions.net/run-pipeline-entrypoint"
    # Use POST with JSON for better compatibility
    cmd = f'''curl -s -w "\\n%{{http_code}}" -X POST "{url}" \
        -H "Content-Type: application/json" \
        -d '{{"brand":"{brand}","source":"{source}"}}'
    '''
    output = run_command(cmd)
    
    lines = output.strip().split('\n')
    if len(lines) < 2:
        return False
    
    response_body = '\n'.join(lines[:-1])
    http_code = lines[-1]
    
    if http_code != "200":
        print(f"Pipeline trigger failed for {brand}/{source}: HTTP {http_code}")
        print(f"Response: {response_body}")
        return False
    
    try:
        response = json.loads(response_body)
        return response.get('status') == 'success'
    except json.JSONDecodeError:
        print(f"Invalid JSON response for {brand}/{source}: {response_body}")
        return False


def main():
    """Main health check logic."""
    brands = ['labessentials', 'hotash']
    # Updated sources based on what the pipeline actually accepts
    sources = ['shopify', 'shopify_customers', 'ga4']
    max_age_hours = 24
    
    print(f"=== Marketing Pipeline Health Check ===")
    print(f"Timestamp: {datetime.utcnow().isoformat()}Z")
    print(f"Max acceptable age: {max_age_hours} hours\n")
    
    all_healthy = True
    stale_tables = []
    
    # Check table freshness for each brand
    for brand in brands:
        print(f"\nChecking {brand.upper()} tables...")
        is_healthy, tables = check_table_freshness(brand, max_age_hours)
        
        if not tables:
            print(f"  ❌ Failed to retrieve table information")
            all_healthy = False
            continue
        
        for table in tables:
            status = "✅" if not table.get('is_stale') else "❌"
            hours = table.get('hours_old', 'unknown')
            print(f"  {status} {table['table_id']}: {hours} hours old")
            
            if table.get('is_stale'):
                stale_tables.append({
                    'brand': brand,
                    'table': table['table_id'],
                    'hours_old': hours
                })
        
        if not is_healthy:
            all_healthy = False
    
    # If tables are stale, attempt to trigger pipelines
    if stale_tables:
        print(f"\n⚠️  Found {len(stale_tables)} stale table(s)")
        print("Attempting to trigger pipelines...")
        
        triggered_brands = set()
        for stale in stale_tables:
            brand = stale['brand']
            if brand not in triggered_brands:
                print(f"\nTriggering {brand} pipelines...")
                for source in sources:
                    success = trigger_pipeline(brand, source)
                    print(f"  {source}: {'✅ Success' if success else '❌ Failed'}")
                triggered_brands.add(brand)
    
    # Final status
    print("\n" + "=" * 40)
    if all_healthy:
        print("✅ All pipelines healthy")
        sys.exit(0)
    else:
        print("❌ Pipeline health check FAILED")
        print(f"Stale tables: {len(stale_tables)}")
        for stale in stale_tables:
            print(f"  - {stale['brand']}.{stale['table']} ({stale['hours_old']}h old)")
        sys.exit(1)


if __name__ == "__main__":
    main()