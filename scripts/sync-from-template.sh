#!/bin/bash
# Thin wrapper around the layer-aware sync CLI.
#
# Embedded .devenv usage (legacy git merge):
#   cd .devenv
#   ./scripts/sync-from-template.sh /path/to/DevEnvTemplate
#
# Host project layer sync (preferred):
#   npm run sync -- --layer agent-context --template /path/to/DevEnvTemplate --apply

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

run_sync_cli() {
  local cli="$REPO_ROOT/dist/scripts/sync/cli.js"
  if [[ ! -f "$cli" ]]; then
    echo "Building sync CLI..."
    (cd "$REPO_ROOT" && npm run build >/dev/null)
  fi
  node "$cli" "$@"
}

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  run_sync_cli --help
  exit 0
fi

if [[ -z "${1:-}" ]]; then
  echo "Error: template path is required for --devenv-merge mode."
  echo "Usage: ./scripts/sync-from-template.sh <template-path>"
  echo "       npm run sync -- --layer agent-context --template <template-path>"
  exit 1
fi

TEMPLATE_PATH="$1"
shift || true

# When this script lives under .devenv/scripts/, merge into that checkout.
if [[ "$(basename "$REPO_ROOT")" == ".devenv" ]]; then
  PROJECT_ROOT="$(cd "$REPO_ROOT/.." && pwd)"
  run_sync_cli --devenv-merge --template "$TEMPLATE_PATH" --project-root "$PROJECT_ROOT" "$@"
else
  run_sync_cli --devenv-merge --template "$TEMPLATE_PATH" --project-root "$REPO_ROOT" "$@"
fi
