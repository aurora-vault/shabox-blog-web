import { createHttp } from "./http.js";
import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "../lib/userToken.js";

// 访客账户专用 http 实例：token 存 shabox_uat，refresh 走 /account/refresh
const userHttp = createHttp({
  getAccessToken,
  setAccessToken,
  clearAccessToken,
  refreshPath: "/account/refresh",
});

const post = (path, body) =>
  userHttp(path, { method: "POST", body: JSON.stringify(body || {}) });

// 注册验证码（注册流程用；忘记密码走 forgot）
export const accountSendCode = (email) => post("/account/send-code", { email });

export const accountRegister = ({ email, password, code, displayName }) =>
  post("/account/register", { email, password, code, displayName });

export const accountLogin = (email, password) =>
  post("/account/login", { email, password });

export const accountLogout = () => post("/account/logout");

export const accountFetchMe = () => userHttp("/account/me");

// 忘记密码：发重置码（无论邮箱是否存在都返回成功，防枚举）
export const accountForgot = (email) => post("/account/forgot", { email });

// 重置密码
export const accountReset = ({ email, code, newPassword }) =>
  post("/account/reset", { email, code, newPassword });

export const accountUpdateMe = (payload) =>
  userHttp("/account/me", { method: "PATCH", body: JSON.stringify(payload || {}) });