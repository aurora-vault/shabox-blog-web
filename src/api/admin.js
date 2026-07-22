import { http } from "./http.js";
import { getAccessToken } from "../lib/token.js";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/v1";

// ===== auth =====
export const adminLogin = (username, password) =>
  http("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const adminLogout = () => http("/auth/logout", { method: "POST" });

export const adminFetchMe = () => http("/auth/me");

// ===== posts =====
export const adminFetchPosts = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const suffix = search.toString() ? `?${search}` : "";
  return http(`/blog/admin/posts${suffix}`);
};

export const adminFetchPost = (id) => http(`/blog/admin/posts/${id}`);

export const adminCreatePost = (data) =>
  http("/blog/admin/posts", { method: "POST", body: JSON.stringify(data) });

export const adminUpdatePost = (id, data) =>
  http(`/blog/admin/posts/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const adminDeletePost = (id) =>
  http(`/blog/admin/posts/${id}`, { method: "DELETE" });

export const adminPublishPost = (id) =>
  http(`/blog/admin/posts/${id}/publish`, { method: "POST" });

export const adminUnpublishPost = (id) =>
  http(`/blog/admin/posts/${id}/unpublish`, { method: "POST" });

export const adminPinPost = (id) =>
  http(`/blog/admin/posts/${id}/pin`, { method: "POST" });

export const adminUnpinPost = (id) =>
  http(`/blog/admin/posts/${id}/unpin`, { method: "POST" });

// ===== tags =====
export const adminFetchTags = () => http("/blog/admin/tags");

export const adminCreateTag = (data) =>
  http("/blog/admin/tags", { method: "POST", body: JSON.stringify(data) });

export const adminUpdateTag = (id, data) =>
  http(`/blog/admin/tags/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });

export const adminDeleteTag = (id) =>
  http(`/blog/admin/tags/${id}`, { method: "DELETE" });

// ===== assets =====
export const adminFetchAssets = (params = {}) => {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  return http(`/blog/admin/assets?${search.toString()}`);
};

export const adminDeleteAsset = (id) =>
  http(`/blog/admin/assets/${id}`, { method: "DELETE" });

// ===== upload（FormData，不能走 http.js 的 JSON 通道；401 不自动重试）=====
export async function adminUploadImage(file) {
  const formData = new FormData();
  formData.append("file", file);

  const headers = {};
  const token = getAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(`${API_BASE_URL}/blog/admin/uploads/images`, {
    method: "POST",
    credentials: "include",
    headers,
    body: formData,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message || "图片上传失败");
  }
  return data;
}
