#!/bin/bash
# Scheduler job for Clarity AI Summaries pipeline
# Project: henzelabs-gpt, Location: us-central1

gcloud scheduler jobs create http labessentials__clarity_ai_summaries__daily \
  --location=us-central1 \
  --project=henzelabs-gpt \
  --schedule="0 3 * * *" \
  --time-zone="America/New_York" \
  --uri="https://us-central1-henzelabs-gpt.cloudfunctions.net/clarity_summaries_entrypoint" \
  --http-method=POST \
  --headers="Content-Type=application/json,User-Agent=Google-Cloud-Scheduler" \
  --message-body='{}'
