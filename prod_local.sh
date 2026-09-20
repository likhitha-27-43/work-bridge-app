#!/usr/bin/env bash
#
# Run the base app-template LOCALLY as the PRODUCTION build (no E2B sandbox).
#
# Unlike dev_local.sh (which runs the Vite dev server with HMR), this builds the
# SPA with `vite build` and serves the static `dist/` from the FastAPI backend —
# byte-for-byte what the deployed sandbox app runs. Use this to reproduce bugs
# that only appear in the production bundle (minified/tree-shaken), which the dev
# server hides.
#
# Single process: FastAPI (uvicorn) on :8080, serving dist/ + proxying /api with
# ALO_API_KEY held server-side. There is NO :5173 here — open :8080.
#
# Config comes from app-template/.env.local (same as dev_local.sh).
#
# Usage:  bash prod_local.sh          (Ctrl-C stops it)
#   Re-run after any src/** change to rebuild (no HMR in prod mode).
# Env overrides:  BACKEND_PORT=8080
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

BACKEND_PORT="${BACKEND_PORT:-8080}"

# --- 1. Load .env.local (the ALO_* vars) -------------------------------------
if [[ -f .env.local ]]; then
  set -a
  # shellcheck disable=SC1091
  source .env.local
  set +a
else
  echo "⚠️  No .env.local found. Copy .env.local.example → .env.local and fill in ALO_API_KEY / ALO_API_BASE_URL / ALO_SPACE_SLUG."
  echo "   Continuing anyway — /api/data shows placeholder data; assistant + connectors stay disabled without a key."
fi

# --- 2. PYTHONPATH so the proxy's platform clients resolve -------------------
SKILLS_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"   # .../seeds/skills/alo
export PYTHONPATH="$SKILLS_ROOT/alo-api-agents/scripts:$SKILLS_ROOT/alo-api-connectors/scripts:$SKILLS_ROOT/alo-api-mcp/scripts${PYTHONPATH:+:$PYTHONPATH}"

# --- 3. Python venv with the backend deps ------------------------------------
VENV="$SCRIPT_DIR/.venv"
if [[ ! -d "$VENV" ]]; then
  echo "📦 Creating local venv ($VENV)…"
  python3 -m venv "$VENV"
fi
PY="$VENV/bin/python"
if ! "$PY" -c "import uvicorn, fastapi, httpx, multipart" >/dev/null 2>&1; then
  echo "📦 Installing backend deps (fastapi, uvicorn, httpx, python-multipart)…"
  "$VENV/bin/pip" install -q --upgrade pip
  "$VENV/bin/pip" install -q fastapi uvicorn httpx python-multipart
fi

# --- 4. Frontend deps (install when missing or stale) ------------------------
if [[ ! -d node_modules || ! -d node_modules/zustand ]]; then
  echo "📦 Installing frontend deps (npm install)…"
  npm install
fi

# --- 5. Build the PRODUCTION bundle ------------------------------------------
echo "🏗️  Building production bundle (vite build → dist/)…"
npm run build

# --- 6. Serve the built dist/ from the backend (prod, single origin) ---------
echo ""
echo "🚀 Production app → http://127.0.0.1:$BACKEND_PORT  (uvicorn serving dist/)"
echo "   This is the SAME build the deployed sandbox app runs. Open this URL."
echo "   (Re-run this script after editing src/** — prod mode has no HMR.)"
echo ""
exec "$PY" -m uvicorn main:app --host 127.0.0.1 --port "$BACKEND_PORT"
