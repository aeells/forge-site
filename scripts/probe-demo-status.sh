#!/usr/bin/env bash
set -euo pipefail

# probe-demo-status.sh
# Local probe of INT demo runtime (does not publish the S3 offline marker).

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
# shellcheck source=scripts/demo-status-lib.sh
source "${ROOT_DIR}/scripts/demo-status-lib.sh"

probe_int_demo_status
echo "demo-status: online=${DEMO_ONLINE} httpCode=${DEMO_HTTP_CODE} checkedAt=${DEMO_CHECKED_AT}"
