<template>
  <PageFrame>
    <h1 class="visually-hidden">登录沙盒屋</h1>
    <AuthPanel title="登录">
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
        <el-button
          type="primary"
          :loading="loading"
          :disabled="!form.email.trim() || !form.password"
          native-type="submit"
          style="width: 100%"
        >登录</el-button>
      </el-form>

      <p v-if="error" class="auth-err">{{ error }}</p>
      <div class="auth-links">
        <router-link to="/account/register">没有账户?注册</router-link>
        <router-link to="/account/forgot">忘记密码</router-link>
      </div>
    </AuthPanel>
  </PageFrame>
</template>

<script setup>
import "./auth-form.css";
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import PageFrame from "@/components/layout/PageFrame.vue";
import AuthPanel from "@/components/widgets/AuthPanel.vue";

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