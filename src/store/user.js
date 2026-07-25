import { defineStore } from "pinia";
import { ref, computed } from "vue";

import {
  accountFetchMe,
  accountForgot,
  accountLogin,
  accountLogout,
  accountRegister,
  accountReset,
  accountSendCode,
} from "@/api/account.js";
import { clearAccessToken, setAccessToken } from "../lib/userToken.js";

// 访客账户 store（仿 store/admin.js，token 走 userToken.js 的 shabox_uat）
export const useUserStore = defineStore("user", () => {
  const user = ref(null);
  const isAuthed = computed(() => Boolean(user.value));

  async function sendCode(email) {
    await accountSendCode(email);
  }

  async function register({ email, password, code, displayName }) {
    const { user: u, accessToken } = await accountRegister({
      email,
      password,
      code,
      displayName,
    });
    setAccessToken(accessToken);
    user.value = u;
    return u;
  }

  async function login(email, password) {
    const { user: u, accessToken } = await accountLogin(email, password);
    setAccessToken(accessToken);
    user.value = u;
    return u;
  }

  async function logout() {
    try {
      await accountLogout();
    } finally {
      clearAccessToken();
      user.value = null;
    }
  }

  async function fetchMe() {
    try {
      user.value = await accountFetchMe();
      return user.value;
    } catch {
      user.value = null;
      return null;
    }
  }

  async function forgot(email) {
    await accountForgot(email);
  }

  async function reset({ email, code, newPassword }) {
    await accountReset({ email, code, newPassword });
  }

  return {
    user,
    isAuthed,
    sendCode,
    register,
    login,
    logout,
    fetchMe,
    forgot,
    reset,
  };
});
