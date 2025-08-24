# Flask API for Marketing Dashboard

This project includes a Flask-based API for serving marketing and analytics data to the dashboard UI.

## Quick Start

1. Ensure you have a `.env` file in the project root with the following variables:
   ```env
   GOOGLE_APPLICATION_CREDENTIALS=./creds/henzelabs-ci.json
   GOOGLE_CLOUD_PROJECT=henzelabs-gpt
   PORT=8080
   ```
2. Start the API:
   ```sh
   chmod +x scripts/start_api.sh
   ./scripts/start_api.sh
   ```
3. The API will be available at `http://127.0.0.1:8080/` (or the port you set in `.env`).

## Endpoints

- `GET /` — Returns API status and available routes.
- `GET /api/health` — Health check (`{"ok": true}`)
- `GET /api/metrics/revenue-daily` — Returns daily revenue from BigQuery view `hotash_core.v_ga4_revenue_daily`.
- `GET /api/metrics/sessions-daily` — Returns daily sessions from BigQuery view `hotash_core.v_ga4_sessions_daily`.
- `GET /api/clarity/top-urls` — Returns top URLs by pageviews from BigQuery table `hotash_raw.clarity_pageviews`.

## Error Handling

- If credentials or tables are missing, endpoints return an empty list (`[]`) instead of crashing.

## Development Notes

- The API always runs on the port specified in `.env` (default 8080).
- Uses `python-dotenv` to load environment variables.
- See `app.py` for implementation details.

---

For UI integration and data visualization, see the upcoming branch for dashboard development.
