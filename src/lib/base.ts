// Resolve backend API paths against the document's base URL.
//
// The app is served two ways and this must work for both:
//  • Raw sandbox URL (public):    document base = https://{port}-{id}.e2b.app/
//  • Central Hub auth gateway:     the proxy injects
//      <base href="/api/v1/apps/hosted/{id}/">
//    so the app lives under a path prefix.
//
// Resolving against `document.baseURI` (which reflects the injected <base href>
// when present, else the sandbox root) makes every API call land on this app's
// own backend in both modes — and stays correct even under client-side routing,
// because it resolves against the base, not the current location.
export function apiUrl(path: string): string {
  const base =
    typeof document !== "undefined" && document.baseURI ? document.baseURI : "/";
  // Strip a leading slash so the path is treated as relative to the base.
  return new URL(path.replace(/^\/+/, ""), base).toString();
}
