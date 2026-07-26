<template>
  <PageFrame>
    <h1 class="visually-hidden">注册沙盒屋</h1>
    <AuthPanel title="注册账户">
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
            <el-input
              v-model="form.code"
              maxlength="6"
              placeholder="6 位验证码"
            />
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
            placeholder="大小写字母 + 数字,至少 8 位"
          />
          <p class="auth-hint" :class="{ 'is-ok': passwordValid }">
            {{
              passwordValid
                ? "密码强度 OK ✓"
                : "需包含大写、小写、数字,至少 8 位"
            }}
          </p>
        </el-form-item>

        <el-form-item label="你的称呼">
          <div class="name-row">
            <span class="rolled-name">{{ form.displayName || "—" }}</span>
            <el-button :disabled="loading" @click="rerollName"
              >换一个 🎲</el-button
            >
          </div>
          <p class="auth-hint">系统随机起名,之后可在账户里改</p>
        </el-form-item>

        <el-button
          type="primary"
          :loading="loading"
          :disabled="!canSubmit"
          native-type="submit"
          style="width: 100%"
          >注册</el-button
        >
      </el-form>

      <p v-if="error" class="auth-err">{{ error }}</p>
      <p v-if="info" class="auth-info">{{ info }}</p>
      <div class="auth-links is-single">
        <router-link to="/account/login">已有账户?登录</router-link>
      </div>
    </AuthPanel>
  </PageFrame>
</template>

<script setup>
import "./auth-form.css";
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import PageFrame from "@/components/layout/PageFrame.vue";
import AuthPanel from "@/components/widgets/AuthPanel.vue";

import { useUserStore } from "@/store/user.js";
import { rollName } from "@/data/nameBank.js";

const router = useRouter();
const userStore = useUserStore();

const form = reactive({ email: "", code: "", password: "", displayName: "" });
const loading = ref(false);
const sending = ref(false);
const error = ref("");
const info = ref("");
const counting = ref(0);
let timer = null;

onMounted(() => {
  form.displayName = rollName();
});

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const passwordValid = computed(() => PASSWORD_RE.test(form.password));
const canSubmit = computed(
  () =>
    Boolean(form.email.trim()) &&
    Boolean(form.code.trim()) &&
    passwordValid.value &&
    Boolean(form.displayName),
);

function rerollName() {
  form.displayName = rollName();
}

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
    info.value = "验证码已发送,请查收邮箱(含垃圾箱)";
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
  if (!passwordValid.value) {
    error.value = "密码不满足复杂度要求";
    return;
  }
  loading.value = true;
  try {
    await userStore.register({
      email: form.email.trim(),
      password: form.password,
      code: form.code.trim(),
      displayName: form.displayName,
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
/* Register 独有:验证码输入行 + 昵称行(反馈/链接/字段提示走 auth-form.css) */
.code-row {
  display: flex;
  gap: 8px;
  width: 100%;
}
.code-row .el-input {
  flex: 1;
}
.name-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  width: 100%;
}
.rolled-name {
  font-weight: bold;
  font-size: 15px;
}
</style>
