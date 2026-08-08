#!/usr/bin/env bash
set -euo pipefail

# demo-status-lib.sh
# Helpers for the offline demo marker served from the INT static-edge S3 bucket.
# Marketing site loads https://int.backbonehq.io/demo-status.js cross-origin via a script tag.

PROBE_URL="https://int.backbonehq.io/auth/login"
DEMO_STATUS_OBJECT_KEY="demo-status.js"

probe_int_demo_status() {
    DEMO_HTTP_CODE="$(curl -sS -o /dev/null -w '%{http_code}' --max-time 15 "${PROBE_URL}" 2>/dev/null || echo "000")"

    if [[ "${DEMO_HTTP_CODE}" =~ ^[24][0-9]{2}$ ]]; then
        DEMO_ONLINE="true"
    else
        DEMO_ONLINE="false"
    fi

    DEMO_CHECKED_AT="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"

    DEMO_HTTP_CODE_JSON="${DEMO_HTTP_CODE}"
    if [[ "${DEMO_HTTP_CODE}" == "000" ]]; then
        DEMO_HTTP_CODE_JSON="0"
    fi
}

render_demo_status_js() {
    local output_path="$1"
    local online="$2"
    local checked_at="$3"
    local http_code="$4"

    mkdir -p "$(dirname "${output_path}")"
    jq -cn \
        --argjson online "${online}" \
        --arg checkedAt "${checked_at}" \
        --arg probe "/auth/login" \
        --argjson httpCode "${http_code}" \
        '{online: $online, checkedAt: $checkedAt, probe: $probe, httpCode: $httpCode}' \
        | jq -r '"window.__backboneDemoStatus=" + (. | tojson) + ";"' > "${output_path}"
}

render_offline_demo_status_js() {
    local output_path="$1"
    local checked_at
    checked_at="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
    render_demo_status_js "${output_path}" "false" "${checked_at}" "502"
}
