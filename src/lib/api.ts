// Thin client for the dashboard's FastAPI backend (main.py).
// The backend exposes the connector-backed named datasets and a single sync.
import { apiUrl } from "./base";

export type Row = Record<string, unknown>;

export interface Dataset {
  rows: Row[];
  row_count?: number;
  source?: string;
  fetched_at?: string | null;
}

export interface SqlSource {
  kind: "sql";
  connection_id: string | number;
  connection_name?: string;
  connector_key?: string;
}

export interface ExcelSource {
  kind: "excel";
  files: { name: string; path: string }[];
}

export type DataSource = SqlSource | ExcelSource;

export interface ConnectorInfo {
  configured: boolean;
  connection_id: string | number;
  source?: DataSource;
  datasets: { key: string; label: string }[];
}

export interface SourceConfig {
  connection_id?: string | number;
  source?: DataSource;
  datasets?: Array<{ key: string; label: string; query?: string | Record<string, unknown> }>;
}

export interface DataResponse {
  datasets: Record<string, Dataset>;
  cache: { exists?: boolean; datasets?: Record<string, { row_count: number; source: string; fetched_at: string | null }> };
  connector: ConnectorInfo;
}

export async function fetchData(): Promise<DataResponse> {
  const res = await fetch(apiUrl("api/data"));
  if (!res.ok) throw new Error(`/api/data failed: ${res.status}`);
  return res.json();
}

export async function syncData(): Promise<{ synced: unknown[]; errors: { key: string; error: string }[] }> {
  const res = await fetch(apiUrl("api/sync"), { method: "POST" });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload?.detail || "Sync failed");
  return payload;
}

export interface BuildInfo {
  build: number;
  ready: boolean;
  // Whether the platform key (ALO_API_KEY) is loaded in the server process. The
  // backend won't serve the real SPA until this is true, so a loaded app always
  // sees keyReady === true; exposed for observability / optional gating.
  keyReady?: boolean;
}

// Current SPA build signal (dist/index.html mtime). The app polls this and reloads
// when it changes, so a rebuilt slice appears live without a manual refresh.
export async function fetchBuildVersion(): Promise<BuildInfo> {
  const res = await fetch(apiUrl("api/build"), { cache: "no-store" });
  if (!res.ok) throw new Error(`/api/build failed: ${res.status}`);
  return res.json();
}

export function rowsOf(data: DataResponse | null, key: string): Row[] {
  const ds = data?.datasets?.[key];
  return ds && Array.isArray(ds.rows) ? ds.rows : [];
}

export function latestSync(data: DataResponse | null): { fetchedAt: string | null; source: string | null } {
  let fetchedAt: string | null = null;
  let source: string | null = null;
  const datasets = data?.datasets ?? {};
  for (const ds of Object.values(datasets)) {
    if (ds?.fetched_at && (!fetchedAt || ds.fetched_at > fetchedAt)) fetchedAt = ds.fetched_at;
    if (ds?.source) source = ds.source;
  }
  return { fetchedAt, source };
}

export async function fetchConfig(): Promise<SourceConfig> {
  const res = await fetch(apiUrl("api/config"));
  if (!res.ok) throw new Error(`/api/config failed: ${res.status}`);
  return res.json();
}

export async function updateDatasetQuery(
  key: string,
  query: string
): Promise<{ updated: string; result: unknown }> {
  const res = await fetch(apiUrl(`api/config/datasets/${encodeURIComponent(key)}`), {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query }),
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload?.detail || "Update failed");
  return payload;
}

export function isNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

export function keysOf(rows: Row[]): string[] {
  return rows[0] ? Object.keys(rows[0]) : [];
}

export function numericKeys(rows: Row[]): string[] {
  return keysOf(rows).filter((k) => rows.some((r) => isNumber(r[k])));
}

export function pickKey(rows: Row[], preferred: string[], fallback?: string): string | undefined {
  const ks = keysOf(rows);
  for (const p of preferred) if (ks.includes(p)) return p;
  return fallback ?? ks[0];
}
