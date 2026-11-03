#!/usr/bin/env bash
#
# Run the base app-template LOCALLY (no E2B sandbox), HMR dev loop.
#
# Starts two processes:
#   - FastAPI backend (uvicorn) on :8080  — proxies to the platform with
#     ALO_API_KEY held server-side, exactly like the sandbox.
#   - Vite dev server on :5173 (HMR)      — its server.proxy (vite.config.ts)
#     forwards /api + /health to the backend.
#
# Open http://localhost:5173. Edits to src/** hot-reload instantly.
#
# Config comes from app-template/.env.local (copy from .env.local.example).
# The real ALO_API_KEY is never committed (.env.local is gitignored).
#
# Usage:  bash dev_local.sh        (Ctrl-C stops both processes)
# Env overrides:  BACKEND_PORT=8080  (uvicorn port; must match vite.config.ts proxy target)
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
# The clients do `sys.path.insert("/home/user/skills/alo-api-*/scripts")` (a
# no-op locally); point Python at the real sibling script dirs in the repo.
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

# --- 4. Frontend deps --------------------------------------------------------
# Install when node_modules is missing OR stale (predates a newer dep in
# package.json — zustand is the canary for the composer deps).
if [[ ! -d node_modules || ! -d node_modules/zustand ]]; then
  echo "📦 Installing frontend deps (npm install)…"
  npm install
fi

# --- 5. Launch backend + vite, clean up both on exit -------------------------
cleanup() {
  trap - INT TERM EXIT
  [[ -n "${BACKEND_PID:-}" ]] && kill "$BACKEND_PID" 2>/dev/null || true
}
trap cleanup INT TERM EXIT

echo "🚀 Backend  → http://127.0.0.1:$BACKEND_PORT  (uvicorn)"
"$PY" -m uvicorn main:app --host 127.0.0.1 --port "$BACKEND_PORT" &
BACKEND_PID=$!

echo "⚡ Frontend → http://localhost:5173  (vite HMR; open this one)"
npm run dev
