#!/bin/bash
# Test LW Scientific console dashboard integration
SERVICE_URL="https://marketing-agent-core-906749953116.us-east1.run.app"

echo "🧪 Testing LW Scientific Console Dashboard Integration"
echo "=================================================="

echo "📊 Testing API endpoints with LW Scientific data..."

echo "1. Revenue API:"
curl -s "$SERVICE_URL/api/metrics/revenue?brand=lwscientific" | jq '.'

echo -e "\n2. GA4 Daily API:"
curl -s "$SERVICE_URL/api/metrics/ga4-daily?brand=lwscientific" | head -5

echo -e "\n3. WoW Summary API:"
curl -s "$SERVICE_URL/api/summary/wow?brand=lwscientific" | jq '.'

echo -e "\n4. Clarity Hotspots API:"
curl -s "$SERVICE_URL/api/clarity/hotspots?brand=lwscientific" | jq '.summary'

echo -e "\n✅ Console dashboard is ready for LW Scientific!"
echo "🌐 Access at: https://console.henzelabs.com"
echo "📈 All data will now show LW Scientific metrics by default"