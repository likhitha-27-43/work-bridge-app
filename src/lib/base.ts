
const API_BASE_URL = "https://work-bridge-backend.onrender.com";

export function apiUrl(path: string): string {
  const cleanPath = path.replace(/^\/+/, "");

  return new URL(
    cleanPath,
    API_BASE_URL.replace(/\/+$/, "") + "/"
  ).toString();
}
