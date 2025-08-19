from src.utils.secret_loader import get_secret

if __name__ == "__main__":
    api_key = get_secret("SHOPIFY_API_KEY", project_id="henzelabs-gpt")
    print(api_key)
