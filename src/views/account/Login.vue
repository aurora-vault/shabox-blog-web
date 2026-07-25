<template>
  <div class="auth-page">
    <el-card>
      <h2>登录沙盒屋</h2>
      <el-form label-position="top" @submit.prevent="onSubmit">
        <el-form-item label="邮箱">
          <el-input
            v-model="form.email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
          />
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            autocomplete="current-password"
          />
        </el-form-item>
        <el-button type="primary" :loading="loading" native-type="submit" style="width: 100%">登录</el-button>
      </el-form>
      <p v-if="error" class="err">{{ error }}</p>
      <div class="links">
        <router-link to="/account/register">没有账户？注册</router-link>
        <router-link to="/account/forgot">忘记密码</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";

import { useUserStore } from "@/store/user.js";

const router = useRouter();
const route = useRoute();
const userStore = useUserStore();
const form = reactive({ email: "", password: "" });
const loading = ref(false);
const error = ref("");

async function onSubmit() {
  error.value = "";
  loading.value = true;
  try {
    await userStore.login(form.email.trim(), form.password);
    router.replace(route.query.redirect || "/");
  } catch (err) {
    error.value = err.message || "登录失败";
  } finally {
    loading.value = false;
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
.err {
  color: #f56c6c;
  margin: 8px 0 0;
  font-size: 13px;
  text-align: center;
}
.links {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 13px;
}
.links a {
  color: #2563eb;
  text-decoration: none;
}
</style>
