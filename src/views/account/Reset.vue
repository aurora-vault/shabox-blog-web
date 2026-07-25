<template>
  <div class="auth-page">
    <el-card>
      <h2>重置密码</h2>
      <el-form label-position="top" @submit.prevent="onSubmit">
        <el-form-item label="注册邮箱">
          <el-input v-model="form.email" type="email" autocomplete="email" />
        </el-form-item>
        <el-form-item label="重置验证码">
          <el-input v-model="form.code" maxlength="6" placeholder="邮箱收到的 6 位码" />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input
            v-model="form.newPassword"
            type="password"
            show-password
            autocomplete="new-password"
            placeholder="至少 8 位"
          />
        </el-form-item>
        <el-button type="primary" :loading="loading" native-type="submit" style="width: 100%">重置密码</el-button>
      </el-form>
      <p v-if="error" class="err">{{ error }}</p>
      <p v-if="ok" class="info">密码已重置，即将跳转登录…</p>
      <div class="links">
        <router-link to="/account/login">返回登录</router-link>
        <router-link to="/account/forgot">没收到码？重发</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { useUserStore } from "@/store/user.js";

const router = useRouter();
const userStore = useUserStore();
const form = reactive({ email: "", code: "", newPassword: "" });
const loading = ref(false);
const error = ref("");
const ok = ref(false);

async function onSubmit() {
  error.value = "";
  ok.value = false;
  loading.value = true;
  try {
    await userStore.reset({
      email: form.email.trim(),
      code: form.code.trim(),
      newPassword: form.newPassword,
    });
    ok.value = true;
    setTimeout(() => router.replace("/account/login"), 1200);
  } catch (err) {
    error.value = err.message || "重置失败";
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
.info {
  color: #67c23a;
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
