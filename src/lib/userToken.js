// 访客账户 access token（localStorage key 独立于 admin 的 shabox_at，避免互相覆盖）
const KEY = "shabox_uat";

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
