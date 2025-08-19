# Marketing Agent Core

A modular Python-based data pipeline for ingesting marketing data from multiple sources, including Shopify and Google Analytics 4 (GA4). The project is designed to support brand-based configurations and extensible data sources, with secure credential management via Google Secret Manager.

## Features

- Ingests marketing data from Shopify and GA4
- Modular source support (e.g., `shopify_orders`, `shopify_customers`, `ga4_events`)
- Brand-based configuration for multi-brand support
- Credentials are securely loaded from Google Secret Manager

## Setup

1. **Clone the repository:**

   ```sh
   git clone <your-repo-url>
   cd marketing-agent-core
   ```

2. **Create and activate a virtual environment:**

   ```sh
   python3 -m venv venv
   source venv/bin/activate
   ```

3. **Install dependencies:**
   ```sh
   pip install -r requirements.txt
   ```

## Usage

Run the pipeline with your desired configuration, brand, and data source:

```sh
python -m src.pipeline --config config.yaml --brand your_brand --source shopify_orders
```

- Replace `config.yaml` with your configuration file
- Replace `your_brand` with the brand identifier
- Replace `shopify_orders` with the desired data source (e.g., `shopify_customers`, `ga4_events`)

**Note:** API credentials are automatically loaded from Google Secret Manager. Ensure your Google Cloud credentials are set up and you have access to the required secrets.

## Author

- Lauren Henze
