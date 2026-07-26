# 方案 05 — 账户页字段样式去重(auth-form.css)

> 范围:仅 `shabox-blog-web`。抽一个共享样式文件,消除四终端页约 50 行重复的 scoped 样式。
> 前提:doc 04 已落地(四终端页 + AuthPanel widget)。

## 背景:重复的是什么

四终端页的 `.err` / `.info` / `.links a` / `.field-hint` 字段级样式字面重复:

- `.err`、`.links a` —— 4 页一字不差
- `.info` —— 3 页一字不差(Forgot/Reset/Register)
- `.field-hint` + `.field-hint.ok` —— 2 页一字不差(Register/Reset)

每页十几行复制粘贴,合计约 50 行。

## 为什么这么去重(三个否决 + 一个正解)

- ❌ **进 `index.css`**:领域专属样式进全局——刚把 `.auth-stage` 撤出全局,不能自相矛盾。
- ❌ **进 AuthPanel 的 scoped**:scoped 够不到 slot 内容(各页表单是 slot 传入,另一套 hash);且 `.err`/`.info` 是「字段反馈」,语义不属于「表单卡外壳」(AuthPanel)。
- ❌ **抽成组件**(如 `<FormMessage>`):就一个 `<p>` + 颜色,过度抽象。
- ✅ **新建 `src/views/account/auth-form.css`**(带前缀 `.auth-*`),各页 `import`。领域内聚(放 account/ 目录)、带前缀不污染、绕开 slot 穿透。

---

## Step 1 — 新建 `src/views/account/auth-form.css`

```css
/* 账户四页共享的字段反馈样式。带前缀避免污染;只被 account 各页 import。
   配合 AuthPanel widget(表单卡外壳)用;这里只管字段级(错误/成功提示、链接、字段提示)。 */
.auth-err {
  color: #f56c6c;
  margin: 8px 0 0;
  font-size: 13px;
  text-align: center;
}
.auth-info {
  color: #67c23a;
  margin: 8px 0 0;
  font-size: 13px;
  text-align: center;
}
.auth-links {
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 13px;
}
.auth-links.is-single {       /* 单链接居中(Register 用) */
  justify-content: center;
}
.auth-links a {
  color: #2563eb;
  text-decoration: none;
}
.auth-hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--text-muted, #909399);
}
.auth-hint.is-ok {
  color: #67c23a;
}
```

---

## Step 2 — 四页改动(class 改前缀 + import + 清 scoped)

> 每页只做三件事:① `<script setup>` 顶部加 `import "./auth-form.css";` ② 模板 class 改前缀 ③ 删掉重复的 scoped。表单逻辑一字不动。

### 2A. `Login.vue`(scoped 整块删掉)

```vue
<template>
  <div class="inner">
    <h1 class="visually-hidden">登录沙盒屋</h1>
    <MottoHeader :showBack="true" />
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
  </div>
</template>

<script setup>
import "./auth-form.css";
import { reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import MottoHeader from "@/components/layout/MottoHeader.vue";
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
```

> Login 再无 `<style scoped>` 块。

### 2B. `Forgot.vue`(scoped 整块删掉)

```vue
<template>
  <div class="inner">
    <h1 class="visually-hidden">找回密码</h1>
    <MottoHeader :showBack="true" />
    <AuthPanel title="忘记密码">
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
          :disabled="counting > 0 || sending || !form.email.trim()"
          :loading="sending"
          native-type="submit"
          style="width: 100%"
        >
          {{ counting > 0 ? `${counting}s 后可重发` : "发送重置验证码" }}
        </el-button>
      </el-form>

      <p v-if="info" class="auth-info">{{ info }}</p>
      <p v-if="error" class="auth-err">{{ error }}</p>
      <div class="auth-links">
        <router-link to="/account/reset">已收到码?去重置</router-link>
        <router-link to="/account/login">返回登录</router-link>
      </div>
    </AuthPanel>
  </div>
</template>

<script setup>
import "./auth-form.css";
import { onUnmounted, reactive, ref } from "vue";
import MottoHeader from "@/components/layout/MottoHeader.vue";
import AuthPanel from "@/components/widgets/AuthPanel.vue";

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
    info.value = "若该邮箱已注册,重置验证码已发送,请查收(含垃圾箱)";
    startCountdown();
  } catch (err) {
    error.value = err.message || "发送失败";
  } finally {
    sending.value = false;
  }
}
</script>
```

> Forgot 再无 `<style scoped>` 块。

### 2C. `Reset.vue`(scoped 整块删掉)

```vue
<template>
  <div class="inner">
    <h1 class="visually-hidden">重置密码</h1>
    <MottoHeader :showBack="true" />
    <AuthPanel title="重置密码">
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
            placeholder="大小写字母 + 数字,至少 8 位"
          />
          <p class="auth-hint" :class="{ 'is-ok': passwordValid }">
            {{ passwordValid ? "密码强度 OK ✓" : "需包含大写、小写、数字,至少 8 位" }}
          </p>
        </el-form-item>
        <el-button
          type="primary"
          :loading="loading"
          :disabled="!canSubmit"
          native-type="submit"
          style="width: 100%"
        >重置密码</el-button>
      </el-form>

      <p v-if="error" class="auth-err">{{ error }}</p>
      <p v-if="ok" class="auth-info">密码已重置,即将跳转登录…</p>
      <div class="auth-links">
        <router-link to="/account/login">返回登录</router-link>
        <router-link to="/account/forgot">没收到码?重发</router-link>
      </div>
    </AuthPanel>
  </div>
</template>

<script setup>
import "./auth-form.css";
import { computed, onUnmounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import MottoHeader from "@/components/layout/MottoHeader.vue";
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
  () => Boolean(form.email.trim()) &&
         Boolean(form.code.trim()) &&
         passwordValid.value
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
```

> Reset 再无 `<style scoped>` 块。

### 2D. `Register.vue`(class 改前缀 + import,scoped 只留独有)

```vue
<template>
  <div class="inner">
    <h1 class="visually-hidden">注册沙盒屋</h1>
    <MottoHeader :showBack="true" />
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
            placeholder="大小写字母 + 数字,至少 8 位"
          />
          <p class="auth-hint" :class="{ 'is-ok': passwordValid }">
            {{ passwordValid ? "密码强度 OK ✓" : "需包含大写、小写、数字,至少 8 位" }}
          </p>
        </el-form-item>

        <el-form-item label="你的称呼">
          <div class="name-row">
            <span class="rolled-name">{{ form.displayName || "—" }}</span>
            <el-button :disabled="loading" @click="rerollName">换一个 🎲</el-button>
          </div>
          <p class="auth-hint">系统随机起名,之后可在账户里改</p>
        </el-form-item>

        <el-button
          type="primary"
          :loading="loading"
          :disabled="!canSubmit"
          native-type="submit"
          style="width: 100%"
        >注册</el-button>
      </el-form>

      <p v-if="error" class="auth-err">{{ error }}</p>
      <p v-if="info" class="auth-info">{{ info }}</p>
      <div class="auth-links is-single">
        <router-link to="/account/login">已有账户?登录</router-link>
      </div>
    </AuthPanel>
  </div>
</template>

<script setup>
import "./auth-form.css";
import { computed, onMounted, onUnmounted, reactive, ref } from "vue";
import { useRouter } from "vue-router";
import MottoHeader from "@/components/layout/MottoHeader.vue";
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
  () => Boolean(form.email.trim()) &&
         Boolean(form.code.trim()) &&
         passwordValid.value &&
         Boolean(form.displayName)
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
```

> Register 的 scoped 从 ~50 行降到 4 个独有选择器;反馈/链接/提示全走 auth-form.css。

---

## class 改名速查

| 旧 | 新 |
|---|---|
| `class="err"` | `class="auth-err"` |
| `class="info"` | `class="auth-info"` |
| `class="links"`(双链接) | `class="auth-links"` |
| `class="links"`(Register 单链接) | `class="auth-links is-single"` |
| `class="field-hint"` | `class="auth-hint"` |
| `:class="{ ok: passwordValid }"` | `:class="{ 'is-ok': passwordValid }"` |

---

## 落地后我会审的点

- **auth-form.css** 在 `src/views/account/`,带 `.auth-*` 前缀;四页都 `import "./auth-form.css"`。
- **scoped 清零**:Login / Forgot / Reset 无 `<style scoped>` 块;Register scoped 只剩 `.code-row` / `.code-row .el-input` / `.name-row` / `.rolled-name`。
- **无残留旧 class**:四页不再有 `.err`/`.info`/`.links`/`.field-hint`(全改前缀)。
- **视觉**:错误红(`#f56c6c`)、成功绿(`#67c23a`)、链接蓝(`#2563eb`)正常;密码强度达标变绿(`.auth-hint.is-ok` 生效);Register 单链接居中(`.is-single`)、其余双链接两端对齐。
- **功能不回归**:四页表单逻辑未动,验证码倒计时、密码复杂度、redirect、reset 1.2s 跳转都正常。

## 不做

- 这轮只去重字段样式,不动 AuthPanel、不动表单结构、不动后端。
- 配色/质感等视觉精修仍留后续(届时只改 `auth-form.css` 一处)。
