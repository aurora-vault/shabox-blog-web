const KEY = "shabox_at";

export function getAccessToken() {
  try {
    return localStorage.getItem(KEY) || "";
  } catch {
    return "";
  }
}

export function setAccessToken(token) {
  try {
    localStorage.setItem(KEY, token);
  } catch {
    // 忽略隐私模式等不可写情况
  }
}

export function clearAccessToken() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // 忽略
  }
}
