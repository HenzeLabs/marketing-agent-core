#!/usr/bin/env bash
set -euo pipefail
URL="${1:-http://127.0.0.1:8080}"

fail() { echo "[FAIL] $1"; exit 1; }

check_json_array() {
	local endpoint="$1"
	local arr
	arr=$(curl -fsS "$URL$endpoint" | jq -e 'if type=="array" and length>0 then . else empty end' || fail "$endpoint empty or not array")
	echo "[OK] $endpoint: $(echo "$arr" | jq length) items"
}

curl -fsS "$URL/_health" || fail "/_health not 200"
curl -fsS "$URL/api/health" || fail "/api/health not 200"
check_json_array "/api/metrics/revenue-daily"
check_json_array "/api/metrics/sessions-daily"
check_json_array "/api/clarity/top-urls"

echo "[PASS] All smoke tests passed."
