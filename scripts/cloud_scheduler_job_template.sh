# TEMPLATE: Cloud Scheduler Job for Brand Data Pipeline (HTTP-triggered Cloud Function)
#
# Usage:
#   1. Copy and customize for each brand/pipeline.
#   2. Replace <brand>, <pipeline>, <function_url>, <project_id>, <schedule>, <timezone> as needed.
#
# Example: labessentials__clarity__daily
#
# gcloud scheduler jobs create http <job_name> \
#   --location=us-central1 \
#   --project=<project_id> \
#   --schedule="<schedule>" \
#   --time-zone="<timezone>" \
#   --uri="<function_url>" \
#   --http-method=POST \
#   --headers="Content-Type=application/json,User-Agent=Google-Cloud-Scheduler" \
#   --message-body='{}'
#
# Example for LabEssentials Clarity:
# gcloud scheduler jobs create http labessentials__clarity__daily \
#   --location=us-central1 \
#   --project=henzelabs-gpt \
#   --schedule="0 2 * * *" \
#   --time-zone="America/New_York" \
#   --uri="https://us-central1-henzelabs-gpt.cloudfunctions.net/clarity_entrypoint" \
#   --http-method=POST \
#   --headers="Content-Type=application/json,User-Agent=Google-Cloud-Scheduler" \
#   --message-body='{}'
