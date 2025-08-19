import os
import json
from google.cloud import secretmanager
import requests
from datetime import datetime, timedelta

PROJECT_ID = "henzelabs-gpt"
SECRETS = [
    "labessentials_prod_clarity_api_key",
    "labessentials_clarity_project_id"
]

# Fetch secrets from Google Secret Manager
def get_secret(secret_id):
    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{PROJECT_ID}/secrets/{secret_id}/versions/latest"
    response = client.access_secret_version(request={"name": name})
    return response.payload.data.decode("UTF-8")

api_key = get_secret(SECRETS[0])
project_id = get_secret(SECRETS[1])

today = datetime.utcnow().date()
start_date = today - timedelta(days=45)

# Prepare Clarity API request
data = {
    "projectId": project_id,
    "startDate": start_date.isoformat(),
    "endDate": today.isoformat(),
    "eventTypes": ["PageView"]
}
headers = {
    "Content-Type": "application/json",
    "Api-Key": api_key
}

response = requests.post(
    "https://api.clarity.microsoft.com/telemetry/exports",
    headers=headers,
    data=json.dumps(data)
)

print("Status Code:", response.status_code)
try:
    print("Response:", json.dumps(response.json(), indent=2))
except Exception:
    print("Response:", response.text)
