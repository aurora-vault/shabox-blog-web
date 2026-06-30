import { defineStore } from "pinia";
import { ref, computed } from "vue";

import { adminLogin, adminLogout, adminFetchMe } from "@/api/admin.js";
import { clearAccessToken, setAccessToken } from "../lib/token.js";

export const useAdminStore = defineStore("admin", () => {
  const user = ref(null);
  const isAuthed = computed(() => Boolean(user.value));

  async function login(username, password) {
    const { user: u, accessToken } = await adminLogin(username, password);
    setAccessToken(accessToken);
    user.value = u;
    return u;
  }

  async function logout() {
    try {
      await adminLogout();
    } finally {
      clearAccessToken();
      user.value = null;
    }
  }

  async function fetchMe() {
    try {
      user.value = await adminFetchMe();
      return user.value;
    } catch {
      user.value = null;
      return null;
    }
  }

  return { user, isAuthed, login, logout, fetchMe };
});
