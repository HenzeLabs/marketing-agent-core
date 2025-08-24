#!/bin/bash
# === Clarity Pipeline Scheduler Job for hotash ===
gcloud scheduler jobs create http hotash__clarity__daily \
  --location=us-central1 \
  --project=henzelabs-gpt \
  --schedule="0 2 * * *" \
  --time-zone="America/New_York" \
  --uri="https://us-central1-henzelabs-gpt.cloudfunctions.net/clarity_entrypoint" \
  --http-method=POST \
  --headers="Content-Type=application/json,User-Agent=Google-Cloud-Scheduler" \
  --message-body='{"brand": "hotash"}'
