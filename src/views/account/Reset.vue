<template>
  <PageFrame>
    <h1 class="visually-hidden">重置密码</h1>
    <AuthPanel title="重置密码">
      <el-form label-position="top" @submit.prevent="onSubmit">
        <el-form-item label="注册邮箱">
          <el-input v-model="form.email" type="email" autocomplete="email" />
        </el-form-item>
        <el-form-item label="重置验证码">
          <el-input
            v-model="form.code"
            maxlength="6"
            placeholder="邮箱收到的 6 位码"
          />
        </el-form-item>
        <el-form-item label="新密码">
          <el-input
            v-model="form.newPassword"
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
        <el-button
          type="primary"
          :loading="loading"
          :disabled="!canSubmit"
          native-type="submit"
          style="width: 100%"
          >重置密码</el-button
        >
      </el-form>

      <p v-if="error" class="auth-err">{{ error }}</p>
      <p v-if="ok" class="auth-info">密码已重置,即将跳转登录…</p>
      <div class="auth-links">
        <router-link to="/account/login">返回登录</router-link>
        <router-link to="/account/forgot">没收到码?重发</router-link>
      </div>
    </AuthPanel>
  </PageFrame>
</template>

<script setup>
import "./auth-form.css";
import { computed, onUnmounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import PageFrame from "@/components/layout/PageFrame.vue";
import AuthPanel from "@/components/widgets/AuthPanel.vue";

import { useUserStore } from "@/store/user.js";

const router = useRouter();
const userStore = useUserStore();
const form = reactive({ email: "", code: "", newPassword: "" });
const loading = ref(false);
const error = ref("");
const ok = ref(false);

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const passwordValid = computed(() => PASSWORD_RE.test(form.newPassword));
const canSubmit = computed(
  () =>
    Boolean(form.email.trim()) &&
    Boolean(form.code.trim()) &&
    passwordValid.value,
);

let pending = null;
onUnmounted(() => {
  if (pending) clearTimeout(pending);
});

async function onSubmit() {
  error.value = "";
  ok.value = false;
  if (!passwordValid.value) {
    error.value = "密码不满足复杂度要求";
    return;
  }
  loading.value = true;
  try {
    await userStore.reset({
      email: form.email.trim(),
      code: form.code.trim(),
      newPassword: form.newPassword,
    });
    ok.value = true;
    pending = setTimeout(() => router.replace("/account/login"), 1200);
  } catch (err) {
    error.value = err.message || "重置失败";
  } finally {
    loading.value = false;
  }
}
</script>
