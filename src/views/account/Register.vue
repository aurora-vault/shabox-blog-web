<template>
  <div class="auth-page">
    <el-card>
      <h2>注册账户</h2>
      <el-form label-position="top" @submit.prevent="onSubmit">
        <el-form-item label="邮箱">
          <el-input
            v-model="form.email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
          />
        </el-form-item>
        <el-form-item label="验证码">
          <div class="code-row">
            <el-input v-model="form.code" maxlength="6" placeholder="6 位验证码" />
            <el-button
              :disabled="counting > 0 || sending"
              :loading="sending"
              @click="onSendCode"
            >
              {{ counting > 0 ? `${counting}s` : "获取验证码" }}
            </el-button>
          </div>
        </el-form-item>
        <el-form-item label="密码">
          <el-input
            v-model="form.password"
            type="password"
            show-password
            autocomplete="new-password"
            placeholder="至少 8 位"
          />
        </el-form-item>
        <el-form-item label="昵称（可选）">
          <el-input v-model="form.displayName" maxlength="32" placeholder="留空则默认" />
        </el-form-item>
        <el-button type="primary" :loading="loading" native-type="submit" style="width: 100%">注册</el-button>
      </el-form>
      <p v-if="error" class="err">{{ error }}</p>
      <p v-if="info" class="info">{{ info }}</p>
      <div class="links">
        <router-link to="/account/login">已有账户？登录</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onUnmounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";

import { useUserStore } from "@/store/user.js";

const router = useRouter();
const userStore = useUserStore();
const form = reactive({ email: "", code: "", password: "", displayName: "" });
const loading = ref(false);
const sending = ref(false);
const error = ref("");
const info = ref("");
const counting = ref(0);
let timer = null;

function startCountdown() {
  counting.value = 60;
  timer = setInterval(() => {
    counting.value -= 1;
    if (counting.value <= 0) {
      clearInterval(timer);
      timer = null;
    }
  }, 1000);
}
onUnmounted(() => {
  if (timer) clearInterval(timer);
});

async function onSendCode() {
  error.value = "";
  info.value = "";
  if (!form.email.trim()) {
    error.value = "请先填写邮箱";
    return;
  }
  sending.value = true;
  try {
    await userStore.sendCode(form.email.trim());
    info.value = "验证码已发送，请查收邮箱（含垃圾箱）";
    startCountdown();
  } catch (err) {
    error.value = err.message || "发送失败";
  } finally {
    sending.value = false;
  }
}

async function onSubmit() {
  error.value = "";
  info.value = "";
  loading.value = true;
  try {
    await userStore.register({
      email: form.email.trim(),
      password: form.password,
      code: form.code.trim(),
      displayName: form.displayName.trim() || undefined,
    });
    router.replace("/");
  } catch (err) {
    error.value = err.message || "注册失败";
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
.code-row {
  display: flex;
  gap: 8px;
  width: 100%;
}
.code-row .el-input {
  flex: 1;
}
.links {
  margin-top: 12px;
  font-size: 13px;
  text-align: center;
}
.links a {
  color: #2563eb;
  text-decoration: none;
}
</style>
