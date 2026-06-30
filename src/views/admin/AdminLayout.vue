<template>
  <el-container class="admin-layout">
    <el-aside width="200px">
      <div class="logo">沙盒屋后台</div>
      <el-menu :default-active="route.path" router>
        <el-menu-item index="/admin/posts">📝 文章</el-menu-item>
        <el-menu-item index="/admin/tags">🏷️ 标签</el-menu-item>
        <el-menu-item index="/admin/assets">🖼️ 图片库</el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <span class="user">{{ admin.user?.displayName || admin.user?.username }}</span>
        <el-button link @click="goHome">主站</el-button>
        <el-button link type="danger" @click="onLogout">登出</el-button>
      </el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRoute, useRouter } from "vue-router";

import { useAdminStore } from "@/store/admin.js";

const route = useRoute();
const router = useRouter();
const admin = useAdminStore();

function goHome() {
  router.push("/");
}

async function onLogout() {
  await admin.logout();
  router.replace("/admin/login");
}
</script>

<style scoped>
.admin-layout {
  height: 100vh;
}
.el-aside {
  background: #001529;
  color: #fff;
}
.logo {
  color: #fff;
  padding: 20px;
  font-size: 16px;
  font-weight: 600;
  text-align: center;
}
.el-aside :deep(.el-menu) {
  background: #001529;
  border: none;
}
.el-aside :deep(.el-menu-item) {
  color: #c9d1d9;
}
.el-aside :deep(.el-menu-item.is-active) {
  background: #1890ff;
  color: #fff;
}
.el-header {
  display: flex;
  align-items: center;
  gap: 12px;
  justify-content: flex-end;
  background: #fff;
  border-bottom: 1px solid #eee;
}
.user {
  margin-right: auto;
  font-weight: 500;
}
.el-main {
  background: #f5f7fa;
}
</style>
