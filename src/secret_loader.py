"""
secret_loader.py

Utility functions for loading API credentials from Google Secret Manager.
"""

from google.cloud import secretmanager
from google.api_core.exceptions import NotFound
import os


def get_secret(secret_id, project_id=None):
    """
    Retrieve a secret value from Google Secret Manager.
    Args:
        secret_id (str): The name of the secret in Secret Manager.
        project_id (str, optional): GCP project ID. If not provided, uses GOOGLE_CLOUD_PROJECT env var.
    Returns:
        str: The secret payload as a string.
    Raises:
        Exception: If the secret is not found or access fails.
    """
    if project_id is None:
        project_id = os.environ.get("GOOGLE_CLOUD_PROJECT")
    if not project_id:
        raise ValueError("GCP project ID must be provided or set in GOOGLE_CLOUD_PROJECT.")

    client = secretmanager.SecretManagerServiceClient()
    name = f"projects/{project_id}/secrets/{secret_id}/versions/latest"
    try:
        response = client.access_secret_version(request={"name": name})
        return response.payload.data.decode("UTF-8")
    except NotFound:
        raise Exception(f"Secret '{secret_id}' not found in project '{project_id}'.")
    except Exception as e:
        raise Exception(f"Failed to access secret '{secret_id}': {e}")


# === USAGE EXAMPLES ===
# ga4_property_id = get_secret("labessentials_ga4_property_ID")
# shopify_token = get_secret("labessentials_prod_shopify_admin_api_token")