<template>
  <div class="auth-page">
    <el-card>
      <h2>忘记密码</h2>
      <el-form label-position="top" @submit.prevent="onSend">
        <el-form-item label="注册邮箱">
          <el-input
            v-model="form.email"
            type="email"
            autocomplete="email"
            placeholder="you@example.com"
          />
        </el-form-item>
        <el-button
          type="primary"
          :disabled="counting > 0 || sending"
          :loading="sending"
          native-type="submit"
          style="width: 100%"
        >
          {{ counting > 0 ? `${counting}s 后可重发` : "发送重置验证码" }}
        </el-button>
      </el-form>
      <p v-if="info" class="info">{{ info }}</p>
      <p v-if="error" class="err">{{ error }}</p>
      <div class="links">
        <router-link to="/account/reset">已收到码？去重置</router-link>
        <router-link to="/account/login">返回登录</router-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { onUnmounted, reactive, ref } from "vue";

import { useUserStore } from "@/store/user.js";

const userStore = useUserStore();
const form = reactive({ email: "" });
const sending = ref(false);
const info = ref("");
const error = ref("");
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

async function onSend() {
  info.value = "";
  error.value = "";
  if (!form.email.trim()) {
    error.value = "请填写邮箱";
    return;
  }
  sending.value = true;
  try {
    await userStore.forgot(form.email.trim());
    info.value = "若该邮箱已注册，重置验证码已发送，请查收（含垃圾箱）";
    startCountdown();
  } catch (err) {
    error.value = err.message || "发送失败";
  } finally {
    sending.value = false;
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
