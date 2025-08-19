
import os
import yaml
from src.utils.secret_loader import get_secret

def load_env_vars_from_config(brand, config_path="config.yaml"):
	"""
	Loads secrets for the given brand from config and sets them as environment variables.
	Returns the full config dict for further use.
	"""

	with open(config_path, "r") as f:
		config = yaml.safe_load(f)

	default_project_id = config.get("default_project_id")
	if not os.environ.get("GOOGLE_CLOUD_PROJECT") and default_project_id:
		os.environ["GOOGLE_CLOUD_PROJECT"] = default_project_id

	brands = config.get("brands", {})
	if brand not in brands:
		raise ValueError(f"Brand '{brand}' not found in config under 'brands'.")

	default_project_id = config.get("default_project_id")
	gcp_project = os.environ.get("GOOGLE_CLOUD_PROJECT", default_project_id)
	if not gcp_project:
		raise ValueError("GCP project ID must be provided in config.yaml as 'default_project_id' or set in GOOGLE_CLOUD_PROJECT.")

	secrets = brands[brand].get("secrets", {})
	# If secrets is a list, set each as an env var with the same name (uppercased)
	if isinstance(secrets, list):
		for secret_id in secrets:
			os.environ[secret_id.upper()] = get_secret(secret_id, project_id=gcp_project).strip()
	elif isinstance(secrets, dict):
		for key, secret_id in secrets.items():
			os.environ[key.upper()] = get_secret(secret_id, project_id=gcp_project).strip()

	return config
