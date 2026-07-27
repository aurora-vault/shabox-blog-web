# 方案 10 — 登录四件套合并 + Profile 上移

> 目标:把 `Login/Register/Forgot/Reset` 四个高度重复的终端页,合并成 **1 个 `Account.vue`(认证入口)+ 1 个 `AuthFlow.vue`(mode 驱动组件)**;`Profile.vue` 上移 views 根;删掉 `account/` 子目录和 `AuthPanel.vue`。
> 动机:四页 template 90% 重复(PageFrame+AuthPanel+el-form+auth-links),改一处动四个文件。合并后改样式只动 AuthFlow 一处。URL 价值用 `?mode=` query 保住(redirect/刷新/后退都不丢)。
> 性质:你手改,我审查。本文给到可手改的骨架。

---

## 一、最终文件树

```
views/
  Home.vue  About.vue  Album.vue  PostDetail.vue
  Account.vue        ← 新(认证入口,/account?mode=...)
  Profile.vue        ← 从 account/ 上移(登录后主页)
components/widgets/
  AuthFlow.vue       ← 新(mode 驱动,吃掉 auth-form.css + AuthPanel + Register 独有样式)
```

**删除**:
- `views/account/Login.vue` / `Register.vue` / `Forgot.vue` / `Reset.vue`
- `views/account/auth-form.css`
- `views/account/Profile.vue`(上移后删原位置)
- `components/widgets/AuthPanel.vue`(被 AuthFlow 取代)
- 整个 `views/account/` 目录清空后删除

**净效果**:删 6 个文件,加 2 个(Account + AuthFlow),Profile 移位。

---

## 二、路由重构(`router/index.js`)

把四条 `/account/*` 合成一条 `/account` + `?mode=`,旧路径加兜底重定向(防外链/书签失效):

```js
// ===== 访客账户 =====
{ path: "/account", name: "Account", component: () => import("@/views/Account.vue") },
{ path: "/account/profile", name: "AccountProfile", component: () => import("@/views/Profile.vue") },

// 旧四路径兜底(保留一阵,确认无外链后可删)
{ path: "/account/login", redirect: to => ({ path: "/account", query: { mode: "login", ...to.query } }) },
{ path: "/account/register", redirect: to => ({ path: "/account", query: { mode: "register", ...to.query } }) },
{ path: "/account/forgot", redirect: to => ({ path: "/account", query: { mode: "forgot", ...to.query } }) },
{ path: "/account/reset", redirect: to => ({ path: "/account", query: { mode: "reset", ...to.query } }) },
```

> `/account/profile` 路径**保持不变**(main.js 守卫和 redirect 链不用大改)。如果你想让主页脱离 `/account` 域,可改 `/me`——但那要同步改 main.js 守卫 + 所有 `redirect=/account/profile` 引用,本期不建议。

---

## 三、`AuthFlow.vue`(核心,widgets/)

**职责**:接收 `mode`,渲染对应表单,调 store,emit `success`。**不含 PageFrame**(壳由 Account.vue 包)。模式互切走 `router-link` 改 query(保留 URL)。

### template(mode 分支渲染字段子集)

```vue
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
```

### script(mode 驱动 + 各 mode 逻辑)

```js
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
```

### style scoped(吃掉 AuthPanel + auth-form.css + Register 独有,全部进这一个文件)

```css
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
```

---

## 四、`Account.vue`(views 根,极薄)

```vue
<template>
  <PageFrame mottoDark="🌙 此心安处" mottoLight="☀️ 归去来兮">
    <h1 class="visually-hidden">{{ h1 }} - 沙盒屋</h1>
    <AuthFlow :key="mode" :mode="mode" :redirect="redirect" />
  </PageFrame>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import PageFrame from "@/components/layout/PageFrame.vue";
import AuthFlow from "@/components/widgets/AuthFlow.vue";

const route = useRoute();
const mode = computed(() => route.query.mode || "login");
const redirect = computed(() => route.query.redirect || "");
const h1 = computed(() => ({ login: "登录", register: "注册", forgot: "找回密码", reset: "重置密码" }[mode.value] || "登录"));
</script>
```

> `:key="mode"`:切 mode(query 变)时 AuthFlow 重新挂载 → 表单自动清空(配合 watch resetForm 双保险)。诗句头占位文案,你定。

---

## 五、`Profile.vue` 上移

- `views/account/Profile.vue` → `views/Profile.vue`(移动,内容不动)。
- 路由 `/account/profile` 的 `component: () => import("@/views/Profile.vue")`(路径改)。
- main.js 守卫里 `redirect=/account/profile` **不用改**(路径没变)。

---

## 六、`main.js` 守卫微调

守卫里登录跳转目标从 `/account/login?redirect=...` 改成 `/account?mode=login&redirect=...`:

```js
return userStore.isAuthed ? true : { path: "/account", query: { mode: "login", redirect: "/account/profile" } };
```

---

## 七、迁移步骤(你手改顺序)

1. 新建 `components/widgets/AuthFlow.vue`(抄 §三)。
2. 新建 `views/Account.vue`(抄 §四)。
3. 移动 `views/account/Profile.vue` → `views/Profile.vue`。
4. 改 `router/index.js`(§二:加 /account + /account/profile,删旧四条或改兜底 redirect)。
5. 改 `main.js`(§六:redirect 目标)。
6. 删 `views/account/`(Login/Register/Forgot/Reset/auth-form.css/Profile 已移)+ `widgets/AuthPanel.vue`。
7. `npm run build` 验证无残留引用。
8. 本地 `npm run dev` 走一遍四模式 + Profile。

---

## 八、我会审的点

- **四模式闭环**:login(成功跳 redirect/首页)、register(发码+随机昵称+注册)、forgot(发码+防枚举文案)、reset(重置+1.2s 跳 login mode)。
- **URL 价值**:`/account?mode=register` 刷新停留;浏览器后退 mode 回退;`?redirect=` 登录后回原页。
- **旧路径兜底**:`/account/login` 等 4 条 → 重定向到 `/account?mode=...`(带原 query)。
- **无残留**:删 account/ + AuthPanel 后,build 无 import 报错;grep 无 `views/account`、无 `AuthPanel` 引用。
- **Profile 上移**:`/account/profile` 仍可访问,守卫 redirect 不断。

---

## 附:弹窗登录(本期不做,留接口)

AuthFlow 不依赖路由后,以后塞弹窗就是一行:`<Modal v-model:show><AuthFlow mode="login" @success="..." /></Modal>`。common/Modal 通用壳 + 任意页触发,本地预览阶段再做。本期先把页内合并做实。
