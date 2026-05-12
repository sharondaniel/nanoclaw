# Hermes SDP Integration — Reference

## What it is

The **hermes-sdp-agent** connects to **ManageEngine ServiceDesk Plus** (SDP) Cloud — the helpdesk at `https://helpdesk.hermes-cargo.com`. Triggered by `@support` in the **Hermes Support** WhatsApp group.

This is NOT Zoho Desk. ManageEngine SDP Cloud uses Zoho OAuth for authentication.

---

## Architecture (FINAL WORKING SETUP)

- **Agent group**: `hermes-sdp-agent` (id: `c31c1cd4-eda9-4d19-a1db-0605f7f7edef`)
- **OneCLI agent id**: `cad70992-268b-4bdd-9715-0700f794ae91`
- **Channel**: WhatsApp group "Hermes Support" (`120363408533615912@g.us`)
- **Trigger**: `@support` (pattern match, case-insensitive)
- **No MCP server, no additional mounts** — the agent calls the SDP REST API via curl through the OneCLI proxy
- **Credential delivery**: OneCLI injects `Authorization: Bearer <token>` automatically for `helpdesk.hermes-cargo.com`

### Why this approach works
The container routes ALL HTTPS through OneCLI (`NODE_USE_ENV_PROXY=1`, `HTTP_PROXY=...`). The `onecli-gateway` skill is auto-generated and cannot be suppressed per-agent. The solution: register the SDP Zoho token in OneCLI for `helpdesk.hermes-cargo.com`. The agent calls the API normally; OneCLI injects the Bearer token automatically.

**Critical**: do NOT mount the SDP project directory (`claude-tickets-sdplus`) into the container — it contains `helpdesk.pttg.com` as a hardcoded fallback which confuses the agent.

---

## OneCLI Secret

| Field | Value |
|-------|-------|
| Secret ID | `1569e17e-d675-4d60-aef4-6c87a3c52069` |
| Name | SDP Zoho OAuth |
| Host pattern | `helpdesk.hermes-cargo.com` |
| Path pattern | `/app/itdesk/*` |
| Header | `Authorization` |
| Format | `Bearer {value}` |

**The token expires every hour.** When it expires, refresh and update OneCLI:

```bash
# Get fresh token
TOKEN=$(curl -s --noproxy '*' -X POST "https://accounts.zoho.com/oauth/v2/token" \
  -d "grant_type=refresh_token" \
  -d "client_id=1000.MJPPUKURQPF2F3ZCI5E1R1L4R2UVBM" \
  -d "client_secret=7a55b6c6399f69821cbbc755a304d22400685c8e04" \
  -d "refresh_token=1000.f61a9f0f03e815c05c21812ba5590285.6ff2e08c79076c30119079fbdd6e0835" \
  | python3 -c "import sys,json; print(json.load(sys.stdin)['access_token'])")

# Update OneCLI secret value
onecli secrets update --id 1569e17e-d675-4d60-aef4-6c87a3c52069 --value "$TOKEN"
```

---

## Zoho OAuth Credentials

| Field | Value |
|-------|-------|
| Client ID | `1000.MJPPUKURQPF2F3ZCI5E1R1L4R2UVBM` |
| Client Secret | `7a55b6c6399f69821cbbc755a304d22400685c8e04` |
| Refresh Token | `1000.f61a9f0f03e815c05c21812ba5590285.6ff2e08c79076c30119079fbdd6e0835` |
| Scope | `SDPOnDemand.requests.ALL` |
| Data center | US (`accounts.zoho.com`) |

---

## SDP Instance Details

| Field | Value |
|-------|-------|
| Base URL | `https://helpdesk.hermes-cargo.com` |
| Instance | `itdesk` |
| Portal | `kaltentech` |
| API path | `https://helpdesk.hermes-cargo.com/app/itdesk/api/v3` |
| Accept header | `application/vnd.manageengine.sdp.v3+json` |

**Note:** `display_id` (e.g. `1017699` — shown to users) ≠ internal `id` (e.g. `119144000038575007` — used in API paths). Search by `display_id` first, then use the returned `id` for updates.

---

## Key API Calls (no --noproxy needed — OneCLI injects token)

### List open tickets
```bash
curl -s "https://helpdesk.hermes-cargo.com/app/itdesk/api/v3/requests" \
  -H "Accept: application/vnd.manageengine.sdp.v3+json" \
  --get --data-urlencode 'input_data={"list_info":{"row_count":10,"sort_field":"created_time","sort_order":"desc","search_fields":{"status":{"name":"Open"}}}}'
```

### Find ticket by display number
```bash
curl -s "https://helpdesk.hermes-cargo.com/app/itdesk/api/v3/requests" \
  -H "Accept: application/vnd.manageengine.sdp.v3+json" \
  --get --data-urlencode 'input_data={"list_info":{"row_count":5,"search_fields":{"display_id":"1017699"}}}'
```

### Add public reply
```bash
curl -s -X POST "https://helpdesk.hermes-cargo.com/app/itdesk/api/v3/requests/INTERNAL_ID/notes" \
  -H "Accept: application/vnd.manageengine.sdp.v3+json" \
  --data-urlencode 'input_data={"note":{"description":"REPLY TEXT","show_to_requester":true}}'
```

### Add internal note
```bash
curl -s -X POST "https://helpdesk.hermes-cargo.com/app/itdesk/api/v3/requests/INTERNAL_ID/notes" \
  -H "Accept: application/vnd.manageengine.sdp.v3+json" \
  --data-urlencode 'input_data={"note":{"description":"NOTE TEXT","show_to_requester":false}}'
```

---

## OAuth Client Setup (if credentials need to be recreated)

1. [api-console.zoho.com](https://api-console.zoho.com/) — log in with the Zoho account that has SDP access
2. **Self Client** → **Generate Code**
3. Scope: `SDPOnDemand.requests.ALL` (**not** `Desk.tickets.ALL` — that's a different product)
4. Exchange code for tokens:

```bash
curl -s --noproxy '*' -X POST "https://accounts.zoho.com/oauth/v2/token" \
  -d "grant_type=authorization_code" \
  -d "client_id=NEW_CLIENT_ID" \
  -d "client_secret=NEW_CLIENT_SECRET" \
  -d "redirect_uri=https://localhost:3000/callback" \
  -d "code=CODE"
```

5. Update OneCLI secret and `groups/hermes-sdp/CLAUDE.local.md`.

---

## Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Agent asks to configure OneCLI | Token expired (1 hour TTL) | Run the refresh + `onecli secrets update` commands above |
| Agent uses `helpdesk.pttg.com` | SDP project directory is mounted (has wrong hardcoded URL) | Remove mount: `UPDATE container_configs SET additional_mounts='[]'` |
| Anthropic 401 in container | SDP secret replaced Anthropic secret in OneCLI | `onecli agents set-secrets --id cad70992... --secret-ids e1db3993...,1569e17e...` |
| `invalid_client` on token refresh | OAuth client deleted | Recreate Self Client in Zoho API Console |
| Agent accumulates messages / hangs | Failed attempts filled inbound DB | `DELETE FROM sessions WHERE agent_group_id='c31c1cd4-...'` + wipe session files |

---

## Files

- Agent instructions: `groups/hermes-sdp/CLAUDE.local.md`
- Existing SDP Node.js project: `/Users/sharondaniel/projects/hermes/claude-tickets-sdplus/` (not mounted — do not mount)
