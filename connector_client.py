"""Server-side data access for the dashboard backend.

Reuses the shared platform clients (which read ALO_API_KEY / ALO_API_BASE_URL /
ALO_SPACE_SLUG from the sandbox env — no credentials are ever stored in this app).
The app-specific target lives in connector_config.json:
  - ``datasets``: SQL connector datasets [{key, label, query}, ...] (one connection_id)
  - ``mcp``: {"datasets": [{key, label, connection_id, tool_name, arguments}, ...]}
Each entry returns compact, dashboard-ready rows cached per dataset key. Both SQL
and MCP datasets are re-fetched on /api/sync, so the dashboard refreshes live.
"""
from __future__ import annotations

import json
import os
import sys
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

# Reuse the shared platform clients (SQL connectors + MCP tool proxy).
sys.path.insert(0, "/home/user/skills/alo-api-connectors/scripts")
sys.path.insert(0, "/home/user/skills/alo-api-mcp/scripts")

BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data.json"
CONFIG_PATH = BASE_DIR / "connector_config.json"


def _read_json(path: Path, default: Any) -> Any:
    if not path.exists():
        return default
    try:
        return json.loads(path.read_text())
    except json.JSONDecodeError:
        return default


def _write_json(path: Path, payload: Any) -> None:
    path.write_text(json.dumps(payload, indent=2, default=str))


def load_connector_config() -> dict[str, Any]:
    cfg = _read_json(CONFIG_PATH, {})
    return cfg if isinstance(cfg, dict) else {}


def get_datasets_config() -> list[dict[str, Any]]:
    datasets = load_connector_config().get("datasets")
    return datasets if isinstance(datasets, list) else []


def get_mcp_datasets() -> list[dict[str, Any]]:
    """MCP-backed dataset specs [{key, label, connection_id, tool_name, arguments}, ...]."""
    mcp = load_connector_config().get("mcp")
    datasets = (mcp or {}).get("datasets") if isinstance(mcp, dict) else None
    return datasets if isinstance(datasets, list) else []


def public_config(config: dict[str, Any] | None = None) -> dict[str, Any]:
    config = dict(config or load_connector_config())
    datasets = config.get("datasets") if isinstance(config.get("datasets"), list) else []
    mcp = config.get("mcp") if isinstance(config.get("mcp"), dict) else {}
    mcp_datasets = mcp.get("datasets") if isinstance(mcp.get("datasets"), list) else []
    source = config.get("source") or {}
    listed = [
        {"key": d.get("key"), "label": d.get("label") or d.get("key"), "source": "sql"}
        for d in datasets
    ] + [
        {"key": d.get("key"), "label": d.get("label") or d.get("key"), "source": "mcp"}
        for d in mcp_datasets
    ]
    return {
        "configured": bool(
            ((config.get("connection_id") or source.get("kind") == "excel") and datasets)
            or mcp_datasets
        ),
        "connection_id": config.get("connection_id", ""),
        "source": source,
        "datasets": listed,
    }


def get_source_config() -> dict[str, Any]:
    """Return the full config including per-dataset queries and source block (not for public API)."""
    cfg = load_connector_config()
    return cfg


def update_dataset_query(key: str, query: Any) -> None:
    """Rewrite a single dataset's SQL query in connector_config.json. SQL only."""
    cfg = load_connector_config()
    source_kind = (cfg.get("source") or {}).get("kind", "sql")
    if source_kind != "sql":
        raise ValueError("Dataset queries are read-only for non-SQL sources.")
    datasets = cfg.get("datasets") if isinstance(cfg.get("datasets"), list) else []
    found = False
    for d in datasets:
        if d.get("key") == key:
            d["query"] = _normalize_query(query)
            found = True
            break
    if not found:
        raise KeyError(f"Dataset '{key}' not found.")
    _write_json(CONFIG_PATH, cfg)


def _normalize_query(query: Any) -> dict[str, Any]:
    """Canonicalize a dataset query into the SQL connector envelope ``{"sql": ...}``.

    Accepts a raw SQL string, the canonical ``{"sql": ...}``, or legacy wrappers
    (``{"operation": "execute_query", "query": "<sql>"}`` / ``{"query": "<sql>"}``)
    and always emits ``{"sql": "<sql>"}`` so the panel round-trip can't double-wrap
    the query. Real action-connector dicts (no string SQL) pass through unchanged.
    """
    if isinstance(query, str):
        return {"sql": query}
    if isinstance(query, dict):
        if isinstance(query.get("sql"), str):
            return query  # already canonical (preserves any params)
        if isinstance(query.get("query"), str):
            return {"sql": query["query"]}
    return query


def set_connector_target(
    connection_id: int | str,
    datasets: list[dict[str, Any]],
    *,
    connection_name: str | None = None,
    connector_key: str | None = None,
) -> dict[str, Any]:
    """Bake the connection id + named dataset queries into server-side config.

    ``datasets`` is a list of {key, label, query}. Each query should be an
    aggregate returning compact, dashboard-ready rows (KPIs, a time series, a
    category breakdown, a bounded detail table). No credentials are accepted or
    stored here — the running app reads them from env. (Build time.)
    """
    if isinstance(connection_id, str) and connection_id.isdigit():
        connection_id = int(connection_id)
    cleaned = dict(load_connector_config())
    cleaned["connection_id"] = connection_id
    cleaned["source"] = {
        "kind": "sql",
        "connection_id": connection_id,
        **({"connection_name": connection_name} if connection_name else {}),
        **({"connector_key": connector_key} if connector_key else {}),
    }
    normalized = []
    for d in datasets or []:
        key = (d.get("key") or "").strip()
        if not key:
            continue
        normalized.append({"key": key, "label": d.get("label") or key, "query": _normalize_query(d.get("query"))})
    cleaned["datasets"] = normalized
    _write_json(CONFIG_PATH, cleaned)
    return public_config(cleaned)


def add_connector_dataset(
    connection_id: int | str,
    dataset: dict[str, Any],
    *,
    connection_name: str | None = None,
    connector_key: str | None = None,
) -> dict[str, Any]:
    """Upsert ONE SQL connector dataset WITHOUT clobbering already-baked datasets.

    Use this to bake a dashboard one slice at a time: add a view's dataset, sync, build
    that view, repeat. The dataset is matched by ``key`` (replaced) or appended. Records
    the connection id/source like ``set_connector_target`` but leaves other datasets
    intact. (``set_connector_target`` is the bulk path and replaces the whole list.)
    """
    if isinstance(connection_id, str) and connection_id.isdigit():
        connection_id = int(connection_id)
    key = (dataset.get("key") or "").strip()
    if not key:
        raise ValueError("dataset must include a non-empty 'key'")
    cfg = dict(load_connector_config())
    cfg["connection_id"] = connection_id
    source = cfg.get("source") if isinstance(cfg.get("source"), dict) else {}
    source = {**source, "kind": "sql", "connection_id": connection_id}
    if connection_name:
        source["connection_name"] = connection_name
    if connector_key:
        source["connector_key"] = connector_key
    cfg["source"] = source
    entry = {"key": key, "label": dataset.get("label") or key, "query": _normalize_query(dataset.get("query"))}
    datasets = cfg.get("datasets") if isinstance(cfg.get("datasets"), list) else []
    datasets = [d for d in datasets if d.get("key") != key]
    datasets.append(entry)
    cfg["datasets"] = datasets
    _write_json(CONFIG_PATH, cfg)
    return public_config(cfg)


def set_excel_source(
    files: list[dict[str, Any]],
    *,
    datasets: list[dict[str, Any]] | None = None,
) -> dict[str, Any]:
    """Record an Excel-backed source (read-only, agent bakes datasets via cache_dataset).

    ``files`` is a list of {name, path} dicts describing the uploaded .xlsx files.
    ``datasets`` is an optional list of {key, label} describing what was baked.
    """
    cleaned = dict(load_connector_config())
    cleaned.pop("connection_id", None)
    cleaned["source"] = {"kind": "excel", "files": [{"name": f.get("name", ""), "path": f.get("path", "")} for f in files]}
    if datasets is not None:
        cleaned["datasets"] = [{"key": d.get("key", ""), "label": d.get("label") or d.get("key", "")} for d in datasets]
    _write_json(CONFIG_PATH, cleaned)
    return public_config(cleaned)


def set_mcp_target(
    datasets: list[dict[str, Any]],
    *,
    connection_id: int | str | None = None,
) -> dict[str, Any]:
    """Bake MCP-backed named datasets into server-side config (re-run on /api/sync).

    ``datasets`` is a list of {key, label, tool_name, arguments, connection_id?}. Each
    entry calls one MCP tool; its result is cached under ``key`` (source="mcp"). Pass a
    top-level ``connection_id`` as the default when entries omit their own. Stored in a
    separate ``mcp`` block so it never clobbers SQL ``datasets`` — a dashboard can mix
    SQL and MCP datasets. (Build time.)
    """
    if isinstance(connection_id, str) and connection_id.isdigit():
        connection_id = int(connection_id)
    cleaned = dict(load_connector_config())
    normalized = []
    for d in datasets or []:
        key = (d.get("key") or "").strip()
        tool = (d.get("tool_name") or "").strip()
        if not key or not tool:
            continue
        cid = d.get("connection_id", connection_id)
        if isinstance(cid, str) and cid.isdigit():
            cid = int(cid)
        normalized.append({
            "key": key,
            "label": d.get("label") or key,
            "connection_id": cid,
            "tool_name": tool,
            "arguments": d.get("arguments") or {},
        })
    cleaned["mcp"] = {"datasets": normalized}
    if connection_id is not None:
        cleaned["mcp"]["connection_id"] = connection_id
    _write_json(CONFIG_PATH, cleaned)
    return public_config(cleaned)


def add_mcp_dataset(
    dataset: dict[str, Any],
    *,
    connection_id: int | str | None = None,
) -> dict[str, Any]:
    """Upsert ONE MCP dataset WITHOUT clobbering already-baked MCP datasets (slice-by-slice).

    ``dataset`` is {key, label, tool_name, arguments, connection_id?}. Matched by ``key``
    (replaced) or appended. The MCP analog of ``add_connector_dataset``; ``set_mcp_target``
    is the bulk path and replaces the whole MCP list.
    """
    if isinstance(connection_id, str) and connection_id.isdigit():
        connection_id = int(connection_id)
    key = (dataset.get("key") or "").strip()
    tool = (dataset.get("tool_name") or "").strip()
    if not key:
        raise ValueError("dataset must include a non-empty 'key'")
    if not tool:
        raise ValueError("dataset must include a non-empty 'tool_name'")
    cid = dataset.get("connection_id", connection_id)
    if isinstance(cid, str) and cid.isdigit():
        cid = int(cid)
    cfg = dict(load_connector_config())
    mcp = cfg.get("mcp") if isinstance(cfg.get("mcp"), dict) else {}
    datasets = mcp.get("datasets") if isinstance(mcp.get("datasets"), list) else []
    entry = {
        "key": key,
        "label": dataset.get("label") or key,
        "connection_id": cid,
        "tool_name": tool,
        "arguments": dataset.get("arguments") or {},
    }
    datasets = [d for d in datasets if d.get("key") != key]
    datasets.append(entry)
    mcp = {**mcp, "datasets": datasets}
    if connection_id is not None:
        mcp["connection_id"] = connection_id
    cfg["mcp"] = mcp
    _write_json(CONFIG_PATH, cfg)
    return public_config(cfg)


def execute_connector_query(connection_id: int | str, query: Any, timeout_seconds: int = 60) -> Any:
    """Run a single connector query via the shared client (env-based creds)."""
    if not connection_id:
        raise ValueError("connection_id is required (set it via set_connector_target)")
    if not os.environ.get("ALO_API_KEY"):
        raise RuntimeError(
            "ALO_API_KEY is not available in this app's environment yet. It is provisioned "
            "automatically when the app is registered — restart the dashboard server (or ask "
            "the assistant to redeploy) so the key is loaded, then retry."
        )
    from alo_connectors_client import AloConnectorsClient

    client = AloConnectorsClient(timeout=timeout_seconds)
    return client.query(connection_id, {"query": _normalize_query(query), "timeout_seconds": timeout_seconds})


def execute_mcp_call(
    connection_id: int | str,
    tool_name: str,
    arguments: dict[str, Any] | None = None,
    timeout_seconds: int = 60,
) -> Any:
    """Call one MCP tool via the platform proxy (env-based creds), like execute_connector_query."""
    if not connection_id:
        raise ValueError("connection_id is required for an MCP dataset")
    if not tool_name:
        raise ValueError("tool_name is required for an MCP dataset")
    if not os.environ.get("ALO_API_KEY"):
        raise RuntimeError(
            "ALO_API_KEY is not available in this app's environment yet. It is provisioned "
            "automatically when the app is registered — restart the dashboard server (or ask "
            "the assistant to redeploy) so the key is loaded, then retry."
        )
    from alo_mcp_client import AloMcpClient

    client = AloMcpClient(timeout=timeout_seconds)
    return client.call_tool(connection_id, tool_name, arguments or {})


def normalize_connector_rows(result: Any) -> list[dict[str, Any]]:
    if isinstance(result, list):
        if len(result) == 1 and isinstance(result[0], dict):
            for value in result[0].values():
                if isinstance(value, list):
                    return normalize_connector_rows(value)
        return [row if isinstance(row, dict) else {"value": row} for row in result]
    if isinstance(result, dict):
        for key in ("rows", "data", "result", "results", "items", "records"):
            value = result.get(key)
            if isinstance(value, list):
                return normalize_connector_rows(value)
            if isinstance(value, dict):
                nested = normalize_connector_rows(value)
                if nested:
                    return nested
        if len(result) == 1:
            only_value = next(iter(result.values()))
            if isinstance(only_value, list):
                return normalize_connector_rows(only_value)
        return [result]
    return []


def load_datasets() -> dict[str, Any]:
    data = _read_json(DATA_PATH, {})
    return data if isinstance(data, dict) else {}


def load_dataset_rows(key: str) -> list[dict[str, Any]]:
    entry = load_datasets().get(key) or {}
    rows = entry.get("rows") if isinstance(entry, dict) else None
    return rows if isinstance(rows, list) else []


def cache_dataset(key: str, rows: list[dict[str, Any]], source: str = "connector") -> dict[str, Any]:
    data = load_datasets()
    entry = {
        "rows": rows,
        "row_count": len(rows),
        "source": source,
        "fetched_at": datetime.now(timezone.utc).isoformat(),
    }
    data[key] = entry
    _write_json(DATA_PATH, data)
    return {"key": key, "row_count": entry["row_count"], "source": source, "fetched_at": entry["fetched_at"]}


def cache_status() -> dict[str, Any]:
    data = load_datasets()
    datasets = {}
    for key, entry in data.items():
        if not isinstance(entry, dict):
            continue
        datasets[key] = {
            "row_count": entry.get("row_count", len(entry.get("rows") or [])),
            "source": entry.get("source", "demo"),
            "fetched_at": entry.get("fetched_at"),
        }
    return {"exists": DATA_PATH.exists(), "datasets": datasets}
