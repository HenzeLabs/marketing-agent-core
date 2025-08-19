# Marketing Agent Core

![GCP](https://img.shields.io/badge/cloud-GCP-blue)
![BigQuery](https://img.shields.io/badge/storage-BigQuery-yellow)
![Python](https://img.shields.io/badge/lang-Python3.11-blue)

A modular Python-based data pipeline for ingesting marketing data from multiple sources, including Shopify and Google Analytics 4 (GA4). Uses the **labessentials_raw** BigQuery dataset as the centralized data warehouse for ingestion and views. The project is designed to support brand-based configurations and extensible data sources, with secure credential management via Google Secret Manager.

## Features

- Ingests marketing data from Shopify and GA4
- Modular source support (e.g., `shopify_orders`, `shopify_customers`, `ga4_events`)
- Brand-based configuration for multi-brand support
- Credentials are securely loaded from Google Secret Manager
- **Centralized BigQuery dataset:** All data and views are stored in the `labessentials_raw` dataset for analytics and reporting.
- **AI Summaries:** Generates summaries and recommendations using heuristics, configurable scoring logic, or can generate summaries using rules-based logic or integrate with LLMs (e.g., GPT-4, Gemini) for deeper insights.
- **Extensible for multiple brands:** Easily templatize ingestion, views, summaries, and UI for multi-brand rollout.

## Getting Started

1. **Clone the repo:**
   ```sh
   git clone <your-repo-url>
   cd marketing-agent-core
   ```
2. **Set up `.env` with GCP and API keys** (see `config.yaml` for required variables)
3. **Install dependencies:**
   ```sh
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
4. **Run a pipeline:**

   ```sh
   python -m scripts.pipeline_shopify
   # or
   python -m scripts.pipeline_clarity
   ```

5. **Start the backend API (Flask):**

   ```sh
   source venv/bin/activate
   FLASK_APP=app.py flask run --reload --port=5050
   ```

6. **Start the frontend:**
   ```sh
   cd ui && npm install && npm run dev
   ```

---

## Multi-Brand & New Brand Onboarding

This project supports multi-brand data ingestion, transformation, and dashboarding. To add a new brand (e.g., `hotash`):

1. Add brand-specific config to `config.yaml` and secrets to Google Secret Manager.
2. Create or update any brand-specific SQL views or schemas as needed.
3. Run the pipeline with the new brand:
   ```sh
   python -m scripts.pipeline_shopify --brand hotash
   python -m scripts.pipeline_clarity --brand hotash
   ```
4. The dashboard will automatically surface new brand data if configured.

---

---

## Dashboard Screenshot

> _Add a clean JPEG or PNG screenshot of your dashboard here for context._
>
> ![Dashboard Screenshot](ui/public/dashboard-sample.png)
>
> _Replace `dashboard-sample.png` with your actual dashboard image when available._

## Usage

### Run the pipeline (advanced)

```sh
python -m src.pipeline --config config.yaml --brand your_brand --source shopify_orders
```

- Replace `config.yaml` with your configuration file
- Replace `your_brand` with the brand identifier
- Replace `shopify_orders` with the desired data source (e.g., `shopify_customers`, `ga4_events`)

**Note:** API credentials are automatically loaded from Google Secret Manager. Ensure your Google Cloud credentials are set up and you have access to the required secrets.

### Create or update Shopify dashboard metrics view in BigQuery

Use the provided script to create or update a BigQuery view for Shopify dashboard metrics:

```sh
python scripts/create_shopify_dashboard_view.py
```

This will create or replace the view `v_shopify_dashboard_metrics` in the `labessentials_raw` dataset of the `henzelabs-gpt` project, aggregating Shopify order data for dashboard use.

---

## Author

- Lauren Henze

---

## Roadmap

- [ ] Add GA4 integration
- [ ] Implement GPT-powered insights API
- [ ] UX polish on dashboard charts
- [ ] Add more extensible connectors (Meta, TikTok, etc.)
