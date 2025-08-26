import os
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import DateRange, Dimension, Metric, RunReportRequest

def fetch_ga4_data(brand: str):
    property_id = os.environ.get(f"{brand}_ga4_property_id".upper())
    if not property_id:
        raise ValueError(f"GA4 property ID not found for brand: {brand}")

    client = BetaAnalyticsDataClient()

    request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="date"), Dimension(name="eventName")],
        metrics=[Metric(name="eventCount")],
        date_ranges=[DateRange(start_date="yesterday", end_date="today")],
    )

    response = client.run_report(request)

    return response