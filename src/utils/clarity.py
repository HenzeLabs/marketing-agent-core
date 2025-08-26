import os
import requests

def fetch_clarity_data(brand: str):
    token = os.environ.get(f"{brand}_clarity_api_token".upper())
    if not token:
        raise ValueError(f"Clarity API token not found for brand: {brand}")

    headers = {
        "Authorization": f"Bearer {token}",
        "Content-type": "application/json"
    }

    params = {"numOfDays": "1"}

    response = requests.get("https://www.clarity.ms/export-data/api/v1/project-live-insights", params=params, headers=headers)
    response.raise_for_status()

    return response.json()
