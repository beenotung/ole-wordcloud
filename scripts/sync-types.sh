#!/bin/bash
set -e
set -o pipefail
dir="$(dirname "$0")"
root="$dir/.."
meld "$root/server/src/types.ts" "$root/app/src/types.ts"
