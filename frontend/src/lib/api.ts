type JsonRecord = Record<string, unknown>;

const AUTH_TOKEN_KEY = "assetflow.auth.token";
const AUTH_SESSION_KEY = "assetflow.auth.session";

function getApiBaseUrl() {
  if (typeof window === "undefined") {
    return import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";
  }

  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/$/, "");
  }

  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return "http://127.0.0.1:5000";
  }

  return "";
}

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  const customHeaders: Record<string, string> = {};
  if (typeof window !== "undefined") {
    const token = window.localStorage.getItem(AUTH_TOKEN_KEY);
    if (token) {
      customHeaders["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...customHeaders,
      ...(options.headers ?? {}),
    },
    ...options,
  });

  let data: JsonRecord | null = null;
  try {
    data = (await response.json()) as JsonRecord;
  } catch {
    data = null;
  }

  if (!response.ok) {
    if ((response.status === 401 || response.status === 403) && typeof window !== "undefined") {
      window.localStorage.removeItem(AUTH_TOKEN_KEY);
      window.localStorage.removeItem(AUTH_SESSION_KEY);
      if (window.location.pathname !== "/") {
        window.location.href = "/";
      }
    }
    throw new Error((data?.message as string | undefined) || "Request failed");
  }

  const payload =
    data && typeof data === "object"
      ? (data.success === true && "data" in data ? data.data : "payload" in data ? data.payload : data)
      : data;

  return (payload ?? ({} as T)) as T;
}

export const api = {
  get: <T>(url: string) => apiRequest<T>(url),
  post: <T>(url: string, body?: any) =>
    apiRequest<T>(url, {
      method: "POST",
      body: body ? JSON.stringify(body) : undefined,
    }),
  put: <T>(url: string, body?: any) =>
    apiRequest<T>(url, {
      method: "PUT",
      body: body ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(url: string) =>
    apiRequest<T>(url, {
      method: "DELETE",
    }),
};

export function downloadCsv(filename: string, rows: Array<Record<string, unknown>>) {
  if (!rows.length) {
    return;
  }

  const headers = Array.from(new Set(rows.flatMap((row) => Object.keys(row))));
  const lines = [headers.join(",")];

  rows.forEach((row) => {
    lines.push(
      headers
        .map((header) => escapeCsv(row[header]))
        .join(","),
    );
  });

  downloadText(filename, lines.join("\n"), "text/csv;charset=utf-8;");
}

export function downloadText(filename: string, content: string, mimeType = "text/plain;charset=utf-8") {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCsv(value: unknown) {
  const text = value == null ? "" : String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export { AUTH_TOKEN_KEY, AUTH_SESSION_KEY };
