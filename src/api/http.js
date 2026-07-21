import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "../lib/token.js";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/v1";

// 共享的 refresh 进行中 promise：并发请求同时 401 时只发一次 refresh
let refreshing = null;

async function refreshAccessToken() {
  if (!refreshing) {
    refreshing = (async () => {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) {
        clearAccessToken();
        throw new Error("refresh 失败");
      }
      const data = await res.json();
      setAccessToken(data.accessToken);
      return data.accessToken;
    })().finally(() => {
      refreshing = null;
    });
  }
  return refreshing;
}

export async function http(path, options = {}) {
  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {}),
  };
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: "include",
    ...options,
    headers,
  });

  // access 过期：单次刷新重试（_retried 防死循环）
  if (response.status === 401 && !options._retried) {
    try {
      await refreshAccessToken();
      return http(path, { ...options, _retried: true });
    } catch {
      clearAccessToken();
      // 落到下面的统一错误处理（抛错 → 上层跳登录）
    }
  }

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const message =
      typeof data === "object" && data?.message ? data.message : "请求失败";
    throw new Error(message);
  }

  return data;
}
