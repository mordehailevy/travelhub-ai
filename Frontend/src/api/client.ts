const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000";

export class ApiClientError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  return localStorage.getItem("travelhub_token");
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  isFormData?: boolean;
}

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, isFormData = false } = options;
  const token = getToken();

  const headers: Record<string, string> = {};
  if (!isFormData) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : isFormData ? (body as FormData) : JSON.stringify(body),
  });

  if (response.status === 204) {
    return undefined as T;
  }

  const contentType = response.headers.get("content-type") ?? "";
  const payload = contentType.includes("application/json") ? await response.json() : await response.text();

  if (!response.ok) {
    const message = typeof payload === "object" && payload && "message" in payload ? String(payload.message) : "Request failed";
    throw new ApiClientError(response.status, message);
  }

  return payload as T;
}

export function imageUrl(fileName: string, width?: number): string {
  // Admin-uploaded images are stored on Cloudinary and come back as full
  // URLs; only the 14 git-committed seed images are bare filenames served
  // from the backend's own /uploads.
  if (fileName.startsWith("http://") || fileName.startsWith("https://")) {
    if (width && fileName.includes("res.cloudinary.com") && fileName.includes("/upload/")) {
      // Ask Cloudinary for a right-sized, auto-format/auto-quality version
      // instead of shipping the original upload at full resolution.
      return fileName.replace("/upload/", `/upload/f_auto,q_auto,w_${width}/`);
    }
    return fileName;
  }
  return `${API_URL}/uploads/${fileName}`;
}

export { API_URL };
