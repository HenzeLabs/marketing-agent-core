# --- App local/dev/ops ---
dev:
	python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt

run:
	FLASK_RUN_PORT=8080 FLASK_RUN_HOST=0.0.0.0 FLASK_APP=app.py flask run

docker-run:
	docker run --rm -p 8080:8080 --env-file .env marketing-agent-core

smoke:
	curl -f http://127.0.0.1:8080/_health

PY := $(shell command -v python3 >/dev/null 2>&1 && echo python3 || echo python)
VENV := .venv
ACT := source $(VENV)/bin/activate

.PHONY: dev run smoke docker-build docker-run deploy clean

dev:
	$(PY) -m venv $(VENV)
	$(ACT) && pip install --upgrade pip
	$(ACT) && pip install -r requirements.txt
	$(ACT) && pip check

run:
	$(ACT) && FLASK_APP=app.py FLASK_RUN_PORT=8080 FLASK_RUN_HOST=0.0.0.0 flask run

smoke:
	curl -fsS http://127.0.0.1:8080/_health && echo " OK"

docker-build:
	docker build -t marketing-agent-core .

docker-run:
	docker run --rm -p 8080:8080 --env-file .env marketing-agent-core

deploy:
	gcloud run deploy marketing-agent-core --source . --project henzelabs-gpt --region us-central1 --allow-unauthenticated --set-env-vars GOOGLE_CLOUD_PROJECT=henzelabs-gpt,PORT=8080

# Create BigQuery core views
views:
	bq mk -f --dataset --location=US henzelabs-gpt:hotash_core || true
	bq query --nouse_legacy_sql < sql/create_core_views.sql

# Create/update Cloud Scheduler jobs
schedule:
	bash scripts/scheduler.sh

clean:
	rm -rf $(VENV) **/__pycache__ .pytest_cache
