#!/bin/bash
# Refresh the Office 365 token for alerts@hermes-cargo.com in OneCLI
# Credentials are read from .env in the project root

SCRIPT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
source "$SCRIPT_DIR/.env" 2>/dev/null

RESPONSE=$(curl -s --noproxy '*' -X POST \
  "https://login.microsoftonline.com/${O365_TENANT_ID}/oauth2/v2.0/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  --data-urlencode "client_id=${O365_CLIENT_ID}" \
  --data-urlencode "client_secret=${O365_CLIENT_SECRET}" \
  --data-urlencode "grant_type=refresh_token" \
  --data-urlencode "refresh_token=${O365_REFRESH_TOKEN}" \
  --data-urlencode "scope=https://graph.microsoft.com/Mail.Read https://graph.microsoft.com/Mail.ReadWrite https://graph.microsoft.com/Mail.Send offline_access")

TOKEN=$(/usr/bin/python3 -c "import sys,json; d=json.loads('$RESPONSE'); print(d['access_token']) if 'access_token' in d else exit(1)" 2>/dev/null)

if [ -z "$TOKEN" ]; then
  echo "$(date): FAILED to refresh O365 token" >> /tmp/o365-token-refresh.log
  exit 1
fi

/usr/local/bin/onecli secrets update --id "${O365_ONECLI_SECRET_ID}" --value "$TOKEN" >> /tmp/o365-token-refresh.log 2>&1
echo "$(date): O365 token refreshed OK" >> /tmp/o365-token-refresh.log
