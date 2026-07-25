<template>
  <div class="auth-page">
    <el-card>
      <h2>我的账户</h2>
      <div v-if="userStore.user" class="profile">
        <p><span>邮箱</span><b>{{ userStore.user.email }}</b></p>
        <p><span>昵称</span><b>{{ userStore.user.displayName || "（未设置）" }}</b></p>
      </div>
      <el-button
        type="danger"
        plain
        :loading="loading"
        style="width: 100%; margin-top: 16px"
        @click="onLogout"
      >退出登录</el-button>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";

import { useUserStore } from "@/store/user.js";

const router = useRouter();
const userStore = useUserStore();
const loading = ref(false);

async function onLogout() {
  loading.value = true;
  try {
    await userStore.logout();
  } finally {
    loading.value = false;
    router.replace("/");
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}
.auth-page .el-card {
  width: 360px;
}
h2 {
  text-align: center;
  margin: 0 0 16px;
}
.profile p {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
  font-size: 14px;
}
.profile span {
  color: #6b7280;
}
</style>
