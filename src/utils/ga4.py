from typing import List, Dict, Any
import datetime
import os
from src.utils.secret_loader import get_secret

def fetch_ga4_data(brand: str) -> List[Dict[str, Any]]:
    """
    Fetches GA4 event data from the Google Analytics Data API for the given brand.
    Requires the google-analytics-data package and service account credentials.
    """
    print(f"[GA4] Fetching GA4 data for brand: {brand}")
    try:
        from google.analytics.data_v1beta import BetaAnalyticsDataClient
        from google.analytics.data_v1beta.types import RunReportRequest, DateRange, Dimension, Metric
    except ImportError:
        print("[GA4] google-analytics-data package not installed. Please install with 'pip install google-analytics-data'.")
        return []

    # Get property ID from secret
    property_id = get_secret(f"{brand}_ga4_property_id")
    if not property_id:
        print(f"[GA4] No GA4 property ID found for brand: {brand}")
        return []

    # Optionally set GOOGLE_APPLICATION_CREDENTIALS if needed
    # os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "/path/to/service_account.json"

    client = BetaAnalyticsDataClient()
    today = datetime.date.today()
    yesterday = today - datetime.timedelta(days=1)
    # Example: fetch last 1 day of events
    request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[
            Dimension(name="eventName"),
            Dimension(name="date"),
            Dimension(name="country"),
            Dimension(name="pageLocation"),
            Dimension(name="pageReferrer"),
            Dimension(name="deviceCategory"),
            Dimension(name="browser"),
            Dimension(name="city"),
            Dimension(name="region"),
        ],
        metrics=[
            Metric(name="eventCount"),
            Metric(name="engagementTimeMsec"),
        ],
        date_ranges=[DateRange(start_date=str(yesterday), end_date=str(today))],
        limit=100
    )
    response = client.run_report(request)
    events = []
    for row in response.rows:
        event = {
            "event_date": row.dimension_values[1].value,
            "event_name": row.dimension_values[0].value,
            "country": row.dimension_values[2].value,
            "page_location": row.dimension_values[3].value,
            "page_referrer": row.dimension_values[4].value,
            "device_category": row.dimension_values[5].value,
            "browser": row.dimension_values[6].value,
            "city": row.dimension_values[7].value,
            "region": row.dimension_values[8].value,
            "event_count": int(row.metric_values[0].value),
            "engagement_time_msec": int(row.metric_values[1].value),
            "ingested_at": datetime.datetime.utcnow().isoformat(),
            "raw_event_data": {"row": [d.value for d in row.dimension_values] + [m.value for m in row.metric_values]}
        }
        events.append(event)
    print(f"[GA4] Retrieved {len(events)} events from GA4 API.")
    return events
