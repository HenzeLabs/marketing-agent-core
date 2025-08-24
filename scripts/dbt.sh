#!/usr/bin/env bash
set -euo pipefail
SECRET="${DBT_SA_SECRET:-dbt-service-account-json}"
KEYFILE="$(mktemp)"
gcloud secrets versions access latest --secret "$SECRET" > "$KEYFILE"
export GOOGLE_APPLICATION_CREDENTIALS="$KEYFILE"
(cd transform/dbt && dbt "$@" --profiles-dir=.)
rm -f "$KEYFILE"
