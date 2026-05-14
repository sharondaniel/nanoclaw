# Alert Classification Rules

The Mail agent reads this file to classify incoming alerts from alerts@hermes-cargo.com.

## Severity Table

| Application | Condition     | Duration  | Severity     | Team / Contact |
|-------------|---------------|-----------|--------------|----------------|
| HBM         | Stop or Start | > 10 min  | **Warning**  | IT Team        |
| HBM         | Stop or Start | > 20 min  | **Critical** | IT Team        |
| HPS         | Stop or Start | > 10 min  | **Warning**  | IT Team        |
| HPS         | Stop or Start | > 20 min  | **Critical** | IT Team        |
| EC2 Server  | Stop or Start | > 5 min   | **Warning**  | IT Team        |
| EC2 Server  | Stop or Start | > 10 min  | **Warning**  | IT Team        |

## Fallback Rules (for unmatched alerts)

| Subject contains    | Severity        |
|--------------------|-----------------|
| ALARM or CRITICAL  | Critical        |
| OK or RESOLVED     | Informational   |
| WARNING            | Warning         |
| SNS confirmation   | Informational   |
| Unknown / other    | Warning (log only, no notification) |

## Actions by Severity

| Severity      | Action                                      |
|---------------|---------------------------------------------|
| Critical      | Notify Sharon immediately via WhatsApp      |
| Warning       | Log silently — include in 24h report        |
| Informational | Log silently — include in 24h report        |

## Adding New Rules

To add a new application or adjust thresholds, edit this file directly.
The agent reads it from /workspace/agent/alert_classification.md.
