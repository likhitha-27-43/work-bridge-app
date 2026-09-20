import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { fileURLToPath, URL } from "node:url";

const backendPort = process.env.ALO_APP_BACKEND_PORT || process.env.BACKEND_PORT || "8080";
const backendTarget = `http://127.0.0.1:${backendPort}`;
const publicHost = process.env.ALO_APP_PUBLIC_HOST;

// Built assets are emitted to dist/ and served by the FastAPI backend (main.py).
// base "./" makes asset URLs RELATIVE so they resolve correctly whether the app
// is served at the sandbox root (raw preview URL) OR proxied under a path prefix
// by the Central Hub auth gateway (which injects a <base href> — relative asset
// URLs then resolve under that prefix, while absolute "/assets/…" would not).
export default defineConfig({
  base: "./",
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
  },
  // HMR loop: forward API/health calls to FastAPI. Local development defaults
  // to :8080; the collaborative sandbox launcher assigns and exports a private
  // backend port while Vite owns the registered public app port.
  server: {
    // Keep Vite's host-header protection enabled. The collaborative launcher
    // supplies this sandbox's exact E2B preview host at runtime.
    allowedHosts: publicHost ? [publicHost] : [],
    proxy: {
      "/api": { target: backendTarget, changeOrigin: true, ws: true },
      "/health": { target: backendTarget, changeOrigin: true },
    },
  },
});
