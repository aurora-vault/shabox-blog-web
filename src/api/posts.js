import { http } from "./http.js";

export async function fetchPosts(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });

  const suffix = search.toString() ? `?${search}` : "";
  return http(`/blog/posts${suffix}`);
}

export async function fetchPostDetail(slug) {
  return http(`/blog/posts/${slug}`);
}

export async function fetchTags() {
  return http("/blog/tags");
}
