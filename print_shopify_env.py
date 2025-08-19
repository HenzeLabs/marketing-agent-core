import os

def print_shopify_env():
    print("LABESSENTIALS_SHOPIFY_SHOP_NAME:", os.environ.get("LABESSENTIALS_SHOPIFY_SHOP_NAME", "<not set>")[:8], "...")
    token = os.environ.get("LABESSENTIALS_PROD_SHOPIFY_ADMIN_API_TOKEN", "<not set>")
    print("LABESSENTIALS_PROD_SHOPIFY_ADMIN_API_TOKEN:", token[:6], "... (length:", len(token), ")")

if __name__ == "__main__":
    print_shopify_env()
