#!/bin/bash
# Deploy LW Scientific console updates
set -euo pipefail

PROJECT=henzelabs-gpt
REGION=us-east1
SERVICE=marketing-agent-core

echo "🚀 Deploying LW Scientific Console Updates..."

# 1. Deploy API backend to Cloud Run
echo "📦 Deploying API backend..."
gcloud run deploy $SERVICE \
  --source . \
  --region $REGION \
  --project $PROJECT \
  --allow-unauthenticated \
  --set-env-vars GOOGLE_CLOUD_PROJECT=$PROJECT

# 2. Deploy console UI
echo "🌐 Deploying console UI..."
cd console-ui
npm run build
cd ..

echo "✅ Deployment complete!"
echo "🌐 Console: https://console.henzelabs.com"
echo "🔗 API: https://marketing-agent-core-906749953116.us-east1.run.app"