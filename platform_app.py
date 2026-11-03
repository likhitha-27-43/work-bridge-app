"""Base-app layer: the reusable FastAPI app + platform-integration routes.

This is the part of the template that has NO dashboard-specific code — it owns
the platform plumbing (connector/MCP data access, the embedded agent assistant,
live-reload, SPA serving, security) so it can be lifted into a shared base-app
template later. ``main.py`` just calls ``create_app()`` and adds any app-type
routes on top (the dashboard adds none today; its UI is all client-side).

Security: ALO_API_KEY / ALO_API_BASE_URL / ALO_SPACE_SLUG are read from env by
the shared clients. The browser never calls the platform directly — it calls
this backend, which proxies with the key held server-side.
"""
import json
import os
import sys
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.responses import (
    FileResponse,
    HTMLResponse,
    JSONResponse,
    RedirectResponse,
    StreamingResponse,
)
from pydantic import BaseModel

from assistant_client import (
    get_assistant_config,
    public_assistant_config,
    resolve_generated_file_url,
    stream_assistant,
    upload_assistant_file,
)
from connector_client import (
    cache_dataset,
    cache_status,
    execute_connector_query,
    execute_mcp_call,
    get_datasets_config,
    get_mcp_datasets,
    get_source_config,
    load_connector_config,
    load_datasets,
    normalize_connector_rows,
    public_config,
    update_dataset_query,
)

BASE_DIR = Path(__file__).resolve().parent
DIST_DIR = BASE_DIR / "dist"

# Durable runtime-env file the hub writes into the sandbox when it provisions
# ALO_API_KEY (and the other ALO_* vars). A running uvicorn reads os.environ
# once at launch, so a freshly-started keyless process — or one whose
# env-injecting restart never landed — would otherwise stay keyless forever.
# We reload from this file at request time (see _ensure_platform_env) so the app
# self-heals the moment the key is provisioned, with no dependence on a
# perfectly-timed restart. Absent in local dev (dev_local.sh sources .env.local).
_RUNTIME_ENV_FILE = Path("/home/user/.alo/app_env.json")


def _ensure_platform_env() -> None:
    """Load the hub-written runtime env into os.environ if the key isn't set yet.

    Idempotent and cheap: once ALO_API_KEY is present it returns immediately.
    Uses setdefault so a value already injected into the process env always wins
    over the file. Best-effort — any read/parse error is swallowed.
    """
    if os.environ.get("ALO_API_KEY"):
        return
    try:
        if not _RUNTIME_ENV_FILE.exists():
            return
        data = json.loads(_RUNTIME_ENV_FILE.read_text())
    except Exception:
        return
    if not isinstance(data, dict):
        return
    for k, v in data.items():
        if isinstance(k, str) and isinstance(v, str):
            os.environ.setdefault(k, v)


# Pick up an already-provisioned key at process start (e.g. a redeploy where the
# hub wrote the file before this uvicorn booted).
_ensure_platform_env()


def _key_ready() -> bool:
    """Whether ALO_API_KEY is present in this process's environment.

    Reloads the hub-written runtime env first (see ``_ensure_platform_env``) so a
    key provisioned *after* launch is picked up without a restart. Used to gate
    the SPA so the app is never shown — and no key-requiring endpoint is ever
    called — before the key is available.
    """
    _ensure_platform_env()
    return True


def _placeholder(*, building: bool) -> str:
    """A tiny standalone loading page (auto-refreshes every 3s), shown until the
    app is both built and key-ready. ``building`` picks the message: the SPA is
    still compiling, vs. built-but-waiting-for-the-platform-key.

    Neutral + theme-aware (prefers-color-scheme) to match the platform look — it
    renders before the SPA loads, so it can't use the app's theme tokens.
    """
    title = "Building…" if building else "Finishing setup…"
    heading = "Setting up your app…" if building else "Finishing setup…"
    sub = (
        "This page refreshes automatically."
        if building
        else "Connecting to the platform — just a moment."
    )
    return f"""<!doctype html><html lang="en"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1"><title>{title}</title>
<meta http-equiv="refresh" content="3">
<style>
body{{font-family:Geist,Inter,system-ui,-apple-system,"Segoe UI",sans-serif;display:grid;place-items:center;min-height:100vh;margin:0;background:#ffffff;color:#171717}}
.box{{text-align:center}}
.spin{{width:30px;height:30px;border:3px solid #e5e5e5;border-top-color:#171717;border-radius:50%;animation:s 1s linear infinite;margin:0 auto 16px}}
@keyframes s{{to{{transform:rotate(360deg)}}}}
.muted{{color:#737373;font-size:13px;margin-top:6px}}
@media (prefers-color-scheme:dark){{body{{background:#171717;color:#fafafa}}.spin{{border-color:#2e2e2e;border-top-color:#fafafa}}.muted{{color:#a3a3a3}}}}
</style></head>
<body><div class="box"><div class="spin"></div><div>{heading}</div>
<div class="muted">{sub}</div></div></body></html>"""


class DatasetQueryUpdate(BaseModel):
    query: str


class AssistantChatRequest(BaseModel):
    message: str | None = None
    messages: list[dict] | None = None
    thread_id: str | None = None
    runtime_config: dict | None = None
    mode: str = "act"
    # Files (from /api/assistant/files) to send to the model with this turn —
    # each is an upload_file() result: {id, name, mimeType, size, presignedUrl}.
    attachments: list[dict] | None = None


def register_platform_routes(app: FastAPI) -> None:
    """Register every base-layer route on *app* (declared before the SPA catch-all)."""

    # --- Connector-backed named datasets -------------------------------------

    @app.get("/api/data")
    async def data():
        return JSONResponse({"datasets": load_datasets(), "cache": cache_status(), "connector": public_config()})

    @app.get("/api/data/{key}")
    async def data_one(key: str):
        datasets = load_datasets()
        if key not in datasets:
            raise HTTPException(status_code=404, detail=f"Unknown dataset: {key}")
        return JSONResponse({"key": key, "dataset": datasets[key]})

    @app.get("/api/cache/status")
    async def get_cache_status():
        return {"cache": cache_status(), "connector": public_config()}

    @app.post("/api/sync")
    async def sync_data():
        """Refresh every baked dataset from its source — SQL connector and/or MCP."""
        config = load_connector_config()
        connection_id = config.get("connection_id")
        sql_datasets = get_datasets_config()
        mcp_datasets = get_mcp_datasets()
        if not sql_datasets and not mcp_datasets:
            raise HTTPException(status_code=400, detail="No datasets configured for this dashboard yet.")
        synced = []
        errors = []
        if connection_id:
            for d in sql_datasets:
                key = d.get("key")
                query = d.get("query")
                if not key or not query:
                    continue
                try:
                    rows = normalize_connector_rows(execute_connector_query(connection_id=connection_id, query=query))
                    synced.append(cache_dataset(key, rows, source="connector"))
                except Exception as exc:
                    errors.append({"key": key, "error": str(exc)})
        for d in mcp_datasets:
            key = d.get("key")
            tool = d.get("tool_name")
            cid = d.get("connection_id")
            if not key or not tool or not cid:
                continue
            try:
                rows = normalize_connector_rows(execute_mcp_call(cid, tool, d.get("arguments") or {}))
                synced.append(cache_dataset(key, rows, source="mcp"))
            except Exception as exc:
                errors.append({"key": key, "error": str(exc)})
        if errors and not synced:
            raise HTTPException(status_code=400, detail="; ".join(f"{e['key']}: {e['error']}" for e in errors))
        return {"synced": synced, "errors": errors, "cache": cache_status(), "connector": public_config(config)}

    @app.get("/api/config")
    async def get_config():
        """Return the full source config including per-dataset SQL queries."""
        return JSONResponse(get_source_config())

    @app.put("/api/config/datasets/{key}")
    async def update_dataset(key: str, body: DatasetQueryUpdate):
        """Rewrite a dataset's SQL query then re-run it live. SQL sources only."""
        config = load_connector_config()
        source_kind = (config.get("source") or {}).get("kind", "sql")
        if source_kind != "sql":
            raise HTTPException(status_code=409, detail="Dataset queries are read-only for non-SQL sources.")
        connection_id = config.get("connection_id")
        if not connection_id:
            raise HTTPException(status_code=400, detail="No SQL connection configured.")
        try:
            update_dataset_query(key, body.query)
        except KeyError as e:
            raise HTTPException(status_code=404, detail=str(e))
        try:
            rows = normalize_connector_rows(
                execute_connector_query(connection_id=connection_id, query=body.query)
            )
            result = cache_dataset(key, rows, source="connector")
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Query saved but re-run failed: {exc}")
        return {"updated": key, "result": result, "cache": cache_status()}

    # --- Embedded agent assistant (optional; dormant until baked) ------------

    @app.get("/api/assistant")
    async def assistant_config():
        """Browser-safe assistant config (enabled, title, placement, greeting, starters)."""
        return JSONResponse(public_assistant_config())

    @app.post("/api/assistant/chat")
    async def assistant_chat(body: AssistantChatRequest):
        """Proxy a chat turn to the platform agent and stream normalized SSE back.

        The API key stays server-side; the browser only talks to this endpoint.
        Conversations are saved on the platform but hidden from its chat list."""
        cfg = public_assistant_config()
        if not cfg.get("enabled"):
            raise HTTPException(status_code=409, detail="The assistant is not enabled for this app.")
        payload = body.messages if body.messages else (body.message or "")
        if not payload:
            raise HTTPException(status_code=400, detail="Provide 'message' or 'messages'.")

        def event_stream():
            try:
                for ev in stream_assistant(
                    payload,
                    thread_id=body.thread_id,
                    runtime_overrides=body.runtime_config,
                    mode=body.mode,
                    attachments=body.attachments,
                ):
                    yield f"data: {json.dumps(ev)}\n\n"
            except Exception as exc:  # surface as a normalized error event
                yield f"data: {json.dumps({'type': 'error', 'message': str(exc)})}\n\n"

        return StreamingResponse(
            event_stream(),
            media_type="text/event-stream",
            headers={"Cache-Control": "no-store", "X-Accel-Buffering": "no"},
        )

    @app.get("/api/assistant/capabilities")
    async def assistant_capabilities():
        """Browser-safe capability bundle for the composer picker.

        Returns agents, models, tools, tool-sets, skills, skill-sets, prompts,
        connections, and MCP connections — with sensitive fields (system_prompt)
        stripped.  Includes ``defaults`` so the composer pre-selects the baked
        agent/model/connections without exposing their IDs to the browser until
        the user explicitly opens the picker.
        """
        cfg = get_assistant_config()
        if not cfg.get("enabled"):
            raise HTTPException(status_code=409, detail="The assistant is not enabled for this app.")
        if not os.environ.get("ALO_API_KEY"):
            raise HTTPException(status_code=503, detail="ALO_API_KEY is not available yet.")

        sys.path.insert(0, "/home/user/skills/alo-api-agents/scripts")
        from alo_agents_client import AloAgentsClient  # noqa: PLC0415

        client = AloAgentsClient()

        def _strip(items: list[dict], drop: tuple = ("system_prompt",)) -> list[dict]:
            return [{k: v for k, v in item.items() if k not in drop} for item in items]

        def _safe(fn):
            try:
                return fn()
            except Exception:
                return []

        agents = _safe(lambda: client.list_agents(include_default=True))
        models = _safe(client.list_models)
        tools = _safe(client.list_tools)
        tool_sets = _safe(client.list_tool_sets)
        skills = _safe(client.list_skills)
        skill_sets = _safe(client.list_skill_sets)
        prompts = _safe(client.list_prompts)

        connections: list = []
        mcp_connections: list = []
        try:
            sys.path.insert(0, "/home/user/skills/alo-api-connectors/scripts")
            from alo_connectors_client import AloConnectorsClient  # noqa: PLC0415

            connections = AloConnectorsClient().list_connections()
        except Exception:
            pass
        try:
            sys.path.insert(0, "/home/user/skills/alo-api-mcp/scripts")
            from alo_mcp_client import AloMcpClient  # noqa: PLC0415

            mcp_connections = AloMcpClient().list_connections()
        except Exception:
            pass

        runtime = cfg.get("runtime") or {}
        defaults = {
            "agent_id": cfg.get("agent_id"),
            "connection_ids": runtime.get("connection_ids") or [],
            "mcp_connection_ids": runtime.get("mcp_connection_ids") or [],
            "model_slug": runtime.get("model_slug"),
            "model_config_id": runtime.get("model_config_id"),
        }

        return JSONResponse({
            "agents": _strip(agents),
            "models": models,
            "tools": tools,
            "tool_sets": tool_sets,
            "skills": _strip(skills),
            "skill_sets": skill_sets,
            "prompts": _strip(prompts),
            "connections": connections,
            "mcp_connections": mcp_connections,
            "defaults": defaults,
        })

    @app.post("/api/assistant/files")
    async def upload_assistant_file_endpoint(file: UploadFile = File(...)):
        """Proxy a file upload to the platform and return the file metadata.

        The API key stays server-side.  The browser only calls this endpoint;
        the platform URL and key are never exposed.
        """
        cfg = public_assistant_config()
        if not cfg.get("enabled"):
            raise HTTPException(status_code=409, detail="The assistant is not enabled for this app.")
        content = await file.read()
        try:
            result = upload_assistant_file(
                filename=file.filename or "upload",
                content=content,
                mime_type=file.content_type or "application/octet-stream",
            )
        except RuntimeError as exc:
            raise HTTPException(status_code=503, detail=str(exc))
        except Exception as exc:
            raise HTTPException(status_code=500, detail=f"Upload failed: {exc}")
        return JSONResponse(result)

    @app.get("/api/assistant/files/download")
    async def download_assistant_file(path: str, thread_id: str):
        """Redirect to a presigned download for a file the assistant generated.

        The browser only knows the sandbox ``path`` (from a streamed file event);
        this resolves the agent + presigned URL server-side with the API key and
        302-redirects to it. The key never reaches the browser.
        """
        cfg = public_assistant_config()
        if not cfg.get("enabled"):
            raise HTTPException(status_code=409, detail="The assistant is not enabled for this app.")
        if not path.startswith("/home/user/"):
            raise HTTPException(status_code=400, detail="Invalid file path.")
        try:
            url = resolve_generated_file_url(path, thread_id)
        except RuntimeError as exc:
            raise HTTPException(status_code=503, detail=str(exc))
        except Exception as exc:
            # Surface the real cause: log it server-side and propagate the
            # upstream HTTP status when present (e.g. 403 = the platform's
            # presigned route isn't API-key callable yet → restart the hub;
            # 404 = agent/file mismatch) instead of a blanket 502.
            print(f"[assistant] file download failed (path={path}): {exc}", file=sys.stderr)
            upstream = getattr(getattr(exc, "response", None), "status_code", None)
            status = upstream if isinstance(upstream, int) and 400 <= upstream < 600 else 502
            raise HTTPException(status_code=status, detail=f"Could not resolve download: {exc}")
        if not url:
            raise HTTPException(status_code=404, detail="File is not available for download.")
        return RedirectResponse(url)

    # --- Live-reload signal + health -----------------------------------------

    @app.get("/api/build")
    async def build_version():
        """Report the current SPA build (so the open page can auto-reload after a
        rebuild) and whether the platform key is loaded (``keyReady``)."""
        index = DIST_DIR / "index.html"
        built = index.exists()
        return {
            "build": index.stat().st_mtime_ns if built else 0,
            "ready": built,
            "keyReady": _key_ready(),
        }

    @app.get("/health")
    async def health():
        return {"status": "ok"}


def register_spa(app: FastAPI) -> None:
    """Register the SPA catch-all + build placeholder. MUST be called last so the
    ``/{full_path:path}`` route never shadows the API routes above (or any
    app-type routes added in between)."""

    @app.get("/{full_path:path}")
    async def spa(full_path: str):
        index = DIST_DIR / "index.html"
        built = DIST_DIR.exists() and index.exists()
        # Static assets are harmless to serve; only the SPA *entry* is gated
        # (below), so the React bundle never bootstraps before the key is loaded.
        if built and full_path:
            candidate = (DIST_DIR / full_path).resolve()
            if str(candidate).startswith(str(DIST_DIR.resolve())) and candidate.is_file():
                return FileResponse(str(candidate))
        # Serve the real app only once it's built AND the platform key is present
        # (provisioned by register-app, loaded on the app's restart). Until then
        # show a self-refreshing placeholder so the user never sees a keyless app
        # or an "ALO_API_KEY is not available" error.
        if built:
            return HTMLResponse(index.read_text())
        return HTMLResponse(_placeholder(building=not built))


def create_app(register_extra=None) -> FastAPI:
    """Build the base FastAPI app.

    Registers the platform-integration routes, then any app-type routes via the
    optional ``register_extra(app)`` callback, then the SPA catch-all last.
    """
    app = FastAPI(title="Dashboard")

    @app.middleware("http")
    async def _refresh_platform_env(request, call_next):
        # Self-heal: pick up a key provisioned after this process launched so the
        # connector/assistant handlers (which read os.environ at call time) work
        # without a restart.
        _ensure_platform_env()
        return await call_next(request)

    register_platform_routes(app)
    if register_extra is not None:
        register_extra(app)
    register_spa(app)
    return app
