#!/bin/bash
# Refresh the SDP Zoho OAuth token in OneCLI every 50 minutes
# Credentials are read from .env in the project root

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$SCRIPT_DIR/.env" 2>/dev/null

TOKEN=$(curl -s --noproxy '*' -X POST "https://accounts.zoho.com/oauth/v2/token" \
  -d "grant_type=refresh_token" \
  -d "client_id=${SDP_OAUTH_CLIENT_ID}" \
  -d "client_secret=${SDP_OAUTH_CLIENT_SECRET}" \
  -d "refresh_token=${SDP_OAUTH_REFRESH_TOKEN}" \
  | /usr/bin/python3 -c "import sys,json; d=json.load(sys.stdin); print(d['access_token']) if 'access_token' in d else exit(1)")

if [ -z "$TOKEN" ]; then
  echo "$(date): Failed to refresh SDP token" >> /tmp/sdp-token-refresh.log
  exit 1
fi

/usr/local/bin/onecli secrets update --id "${SDP_ONECLI_SECRET_ID}" --value "$TOKEN" >> /tmp/sdp-token-refresh.log 2>&1
echo "$(date): SDP token refreshed successfully" >> /tmp/sdp-token-refresh.log
