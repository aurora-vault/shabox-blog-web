<template>
  <div class="auth-stage">
    <div class="auth-panel side-card">
      <h2 class="auth-heading">{{ title }}</h2>

      <el-form label-position="top" @submit.prevent="onSubmit">
        <!-- 邮箱:四个 mode 都要(forgot 只用它) -->
        <el-form-item label="邮箱">
          <el-input v-model="form.email" type="email" autocomplete="email" placeholder="you@example.com" />
        </el-form-item>

        <!-- 验证码:register / reset -->
        <el-form-item v-if="mode === 'register' || mode === 'reset'" :label="mode === 'reset' ? '重置验证码' : '验证码'">
          <div class="code-row">
            <el-input v-model="form.code" maxlength="6" :placeholder="mode === 'reset' ? '邮箱收到的 6 位码' : '6 位验证码'" />
            <el-button v-if="mode === 'register'" :disabled="counting > 0 || sending" :loading="sending" @click="onSendCode">
              {{ counting > 0 ? `${counting}s` : "获取验证码" }}
            </el-button>
          </div>
        </el-form-item>

        <!-- 密码:login / register / reset(forgot 不要) -->
        <el-form-item v-if="showPassword" :label="mode === 'reset' ? '新密码' : '密码'">
          <el-input
            v-model="form.password"
            type="password" show-password
            :autocomplete="mode === 'login' ? 'current-password' : 'new-password'"
            placeholder="大小写字母 + 数字,至少 8 位"
          />
          <p v-if="mode !== 'login'" class="auth-hint" :class="{ 'is-ok': passwordValid }">
            {{ passwordValid ? "密码强度 OK ✓" : "需包含大写、小写、数字,至少 8 位" }}
          </p>
        </el-form-item>

        <!-- 昵称:register 独有 -->
        <el-form-item v-if="mode === 'register'" label="你的称呼">
          <div class="name-row">
            <span class="rolled-name">{{ form.displayName || "—" }}</span>
            <el-button :disabled="loading" @click="rerollName">换一个 🎲</el-button>
          </div>
          <p class="auth-hint">系统随机起名,之后可在账户里改</p>
        </el-form-item>

        <el-button type="primary" :loading="loading" :disabled="!canSubmit" native-type="submit" style="width: 100%">
          {{ submitText }}
        </el-button>
      </el-form>

      <p v-if="error" class="auth-err">{{ error }}</p>
      <p v-if="info" class="auth-info">{{ info }}</p>

      <!-- 模式互切:router-link 改 query,redirect 透传 -->
      <div class="auth-links" :class="{ 'is-single': links.length === 1 }">
        <router-link
          v-for="l in links"
          :key="l.mode"
          :to="{ path: '/account', query: { mode: l.mode, redirect: redirect || undefined } }"
        >{{ l.text }}</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, reactive, ref, onMounted, onUnmounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useUserStore } from "@/store/user.js";
import { rollName } from "@/data/nameBank.js";

const props = defineProps({
  mode: { type: String, default: "login" }, // login | register | forgot | reset
  redirect: { type: String, default: "" },
});
const emit = defineEmits(["success"]);

const route = useRoute();
const router = useRouter();
const userStore = useUserStore();

const form = reactive({ email: "", code: "", password: "", displayName: "" });
const loading = ref(false);
const sending = ref(false);
const error = ref("");
const info = ref("");
const ok = ref(false);
const counting = ref(0);
let timer = null;
let pending = null;

const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
const passwordValid = computed(() => PASSWORD_RE.test(form.password));

// 切 mode 时清空表单 + 重置随机昵称
watch(() => props.mode, () => { resetForm(); }, { immediate: false });
function resetForm() {
  form.email = ""; form.code = ""; form.password = "";
  error.value = ""; info.value = ""; ok.value = "";
  if (props.mode === "register") form.displayName = rollName();
}

onMounted(() => { if (props.mode === "register") form.displayName = rollName(); });
onUnmounted(() => { if (timer) clearInterval(timer); if (pending) clearTimeout(pending); });

const title = computed(() => ({
  login: "登录", register: "注册账户", forgot: "忘记密码", reset: "重置密码",
}[props.mode]));
const submitText = computed(() => ({
  login: "登录", register: "注册", forgot: "发送重置验证码", reset: "重置密码",
}[props.mode]));
const showPassword = computed(() => props.mode !== "forgot");
const canSubmit = computed(() => {
  if (!form.email.trim()) return false;
  if (props.mode === "forgot") return true;
  if (props.mode === "login") return Boolean(form.password);
  if (!form.code.trim() || !passwordValid.value) return false;
  if (props.mode === "register") return Boolean(form.displayName);
  return true;
});
// 各 mode 底下的互切链接
const links = computed(() => {
  if (props.mode === "login") return [
    { mode: "register", text: "没有账户?注册" }, { mode: "forgot", text: "忘记密码" }];
  if (props.mode === "register") return [{ mode: "login", text: "已有账户?登录" }];
  if (props.mode === "forgot") return [
    { mode: "reset", text: "已收到码?去重置" }, { mode: "login", text: "返回登录" }];
  return [{ mode: "login", text: "返回登录" }, { mode: "forgot", text: "没收到码?重发" }];
});

function rerollName() { form.displayName = rollName(); }
function startCountdown() {
  counting.value = 60;
  timer = setInterval(() => { counting.value -= 1; if (counting.value <= 0) { clearInterval(timer); timer = null; } }, 1000);
}

async function onSendCode() {
  error.value = ""; info.value = "";
  if (!form.email.trim()) { error.value = "请先填写邮箱"; return; }
  sending.value = true;
  try {
    await userStore.sendCode(form.email.trim());
    info.value = "验证码已发送,请查收邮箱(含垃圾箱)";
    startCountdown();
  } catch (e) { error.value = e.message || "发送失败"; }
  finally { sending.value = false; }
}

async function onSubmit() {
  error.value = ""; info.value = ""; ok.value = false;
  if (showPassword.value && props.mode !== "login" && !passwordValid.value) {
    error.value = "密码不满足复杂度要求"; return;
  }
  loading.value = true;
  try {
    if (props.mode === "login") {
      await userStore.login(form.email.trim(), form.password);
      emit("success"); router.replace(props.redirect || "/");
    } else if (props.mode === "register") {
      await userStore.register({ email: form.email.trim(), password: form.password, code: form.code.trim(), displayName: form.displayName });
      emit("success"); router.replace("/");
    } else if (props.mode === "forgot") {
      await userStore.forgot(form.email.trim());
      info.value = "若该邮箱已注册,重置验证码已发送,请查收(含垃圾箱)";
      startCountdown();
    } else if (props.mode === "reset") {
      await userStore.reset({ email: form.email.trim(), code: form.code.trim(), newPassword: form.password });
      ok.value = true; info.value = "密码已重置,即将跳转登录…";
      pending = setTimeout(() => router.replace({ path: "/account", query: { mode: "login" } }), 1200);
    }
  } catch (e) { error.value = e.message || "操作失败"; }
  finally { loading.value = false; }
}
</script>

<style scoped>
/* 原 AuthPanel 的壳 */
.auth-stage { display: flex; justify-content: center; padding: 40px 0; }
.auth-panel { width: 360px; padding: 24px; }
.auth-heading { text-align: center; margin: 0 0 16px; }
/* 原 auth-form.css */
.auth-err { color: #f56c6c; margin: 8px 0 0; font-size: 13px; text-align: center; }
.auth-info { color: #67c23a; margin: 8px 0 0; font-size: 13px; text-align: center; }
.auth-links { display: flex; justify-content: space-between; margin-top: 12px; font-size: 13px; }
.auth-links.is-single { justify-content: center; }
.auth-links a { color: #2563eb; text-decoration: none; }
.auth-hint { margin: 6px 0 0; font-size: 12px; color: var(--text-muted, #909399); }
.auth-hint.is-ok { color: #67c23a; }
/* 原 Register 独有 */
.code-row { display: flex; gap: 8px; width: 100%; }
.code-row .el-input { flex: 1; }
.name-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; width: 100%; }
.rolled-name { font-weight: bold; font-size: 15px; }
</style>