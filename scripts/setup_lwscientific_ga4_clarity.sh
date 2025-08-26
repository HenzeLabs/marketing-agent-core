#!/bin/bash
# Setup LW Scientific GA4 and Clarity integration
PROJECT_ID="henzelabs-gpt"

echo "🚀 Setting up LW Scientific GA4 and Clarity..."

# Copy the same GA4 service account JSON from labessentials
echo "📋 Copying GA4 service account..."
gcloud secrets versions access latest --secret="labessentials_ga4_service_account_json" --project=$PROJECT_ID | \
gcloud secrets versions add lwscientific_ga4_service_account_json --data-file=- --project=$PROJECT_ID

# Set GA4 property ID (you'll need to provide the actual LW Scientific GA4 property ID)
echo "🔢 Setting GA4 property ID (placeholder - update with real ID)..."
gcloud secrets versions add lwscientific_ga4_property_id --data-file=<(echo -n "PLACEHOLDER_GA4_PROPERTY_ID") --project=$PROJECT_ID

# Clarity API key is already set, let's verify
echo "🔍 Verifying Clarity API key..."
CLARITY_KEY=$(gcloud secrets versions access latest --secret="lwscientific_prod_clarity_api_key" --project=$PROJECT_ID)
if [ "$CLARITY_KEY" = "placeholder" ]; then
    echo "⚠️  Clarity API key is still placeholder - update it with real key"
else
    echo "✅ Clarity API key is set"
fi

echo "✅ LW Scientific GA4 and Clarity setup complete!"
echo "📝 Next steps:"
echo "   1. Update lwscientific_ga4_property_id with real GA4 property ID"
echo "   2. Update lwscientific_prod_clarity_api_key if needed"
echo "   3. Run ingestion: curl -X POST '$SERVICE_URL/admin/ingest/ga4?brand=lwscientific'"
echo "   4. Run ingestion: curl -X POST '$SERVICE_URL/admin/ingest/clarity?brand=lwscientific'"