import { publicHttp } from "./http.js";

export async function fetchPosts(params = {}) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });

  const suffix = search.toString() ? `?${search}` : "";
  return publicHttp(`/blog/posts${suffix}`); // http → publicHttp
}

export async function fetchPostDetail(slug) {
  return publicHttp(`/blog/posts/${slug}`); // http → publicHttp
}

export async function fetchTags() {
  return publicHttp("/blog/tags"); // http → publicHttp
}
