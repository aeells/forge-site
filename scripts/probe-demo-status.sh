#!/usr/bin/env bash
set -euo pipefail

# probe-demo-status.sh
# Server-side heartbeat for INT demo runtime (ALB/BFF path). Writes public/assets/demo-status.json.
# Online: HTTP 2xx/4xx on /auth/login (405 = BFF alive). Offline: 5xx or connection failure.

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
OUTPUT_FILE="${ROOT_DIR}/public/assets/demo-status.json"
PROBE_URL="https://int.forgeplatform.software/auth/login"

http_code="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "${PROBE_URL}" 2>/dev/null || echo "000")"

online="false"
if [[ "${http_code}" =~ ^[24][0-9]{2}$ ]]; then
  online="true"
fi

checked_at="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

# httpCode is numeric; curl failures surface as 0 (from "000").
http_code_json="${http_code}"
if [[ "${http_code}" == "000" ]]; then
  http_code_json="0"
fi

mkdir -p "$(dirname "${OUTPUT_FILE}")"
cat > "${OUTPUT_FILE}" <<EOF
{
  "online": ${online},
  "checkedAt": "${checked_at}",
  "probe": "/auth/login",
  "httpCode": ${http_code_json}
}
EOF

echo "demo-status: online=${online} httpCode=${http_code} checkedAt=${checked_at}"
