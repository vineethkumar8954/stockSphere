const BASE = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

function getToken(): string | null {
    return localStorage.getItem("token");
}

export function setToken(token: string) {
    localStorage.setItem("token", token);
}

export function clearToken() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
}

async function request<T>(
    path: string,
    options: RequestInit = {},
    requiresAuth = true
): Promise<T> {
    const headers: Record<string, string> = {
        "Content-Type": "application/json",
        ...(options.headers as Record<string, string>),
    };

    if (requiresAuth) {
        const token = getToken();
        if (token) headers["Authorization"] = `Bearer ${token}`;
    }

    try {
        const res = await fetch(`${BASE}${path}`, { ...options, headers });

        if ((res.status === 401 || res.status === 403) && requiresAuth) {
            clearToken();
            window.location.href = "/login";
            throw new Error("Session expired. Please login again.");
        }

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Request failed");
        return data as T;
    } catch (err: any) {
        if (err.name === "TypeError" && err.message.includes("fetch")) {
            throw new Error("Cannot connect to server. Is the backend running?");
        }
        throw err;
    }
}

export const api = {
    get: <T>(path: string, auth = true) => request<T>(path, {}, auth),
    post: <T>(path: string, body: unknown, auth = true) => request<T>(path, { method: "POST", body: JSON.stringify(body) }, auth),
    put: <T>(path: string, body: unknown, auth = true) => request<T>(path, { method: "PUT", body: JSON.stringify(body) }, auth),
    delete: <T>(path: string, auth = true) => request<T>(path, { method: "DELETE" }, auth),
};
