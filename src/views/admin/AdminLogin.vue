<template>
  <div class="admin-login">
    <el-card>
      <h2>沙盒屋 · 后台登录</h2>
      <el-form label-position="top" @submit.prevent="onSubmit">
        <el-form-item label="用户名">
          <el-input v-model="form.username" autocomplete="username" />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            autocomplete="current-password"
          />
        </el-form-item>
        <el-button
          type="primary"
          :loading="loading"
          native-type="submit"
          style="width: 100%"
          >登录</el-button
        >
      </el-form>
      <p v-if="error" class="err">{{ error }}</p>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { useAdminStore } from "@/store/admin.js";

const router = useRouter();
const admin = useAdminStore();
const form = reactive({ username: "", password: "" });
const loading = ref(false);
const error = ref("");

async function onSubmit() {
  error.value = "";
  loading.value = true;
  try {
    await admin.login(form.username.trim(), form.password);
    router.replace("/admin/posts");
  } catch (err) {
    error.value = err.message || "登录失败";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.admin-login {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
}
.admin-login .el-card {
  width: 360px;
}
h2 {
  text-align: center;
  margin: 0 0 16px;
}
.err {
  color: #f56c6c;
  margin: 8px 0 0;
  font-size: 13px;
  text-align: center;
}
</style>
