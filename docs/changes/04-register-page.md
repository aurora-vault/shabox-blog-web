# 方案 04 — 账户四页(终端页 + AuthPanel widget,Album/About 同款)

> 范围:`shabox-blog-web`(撤全局 `.auth-*` + 删 AuthLayout + 建 `widgets/AuthPanel` + 四终端页内联)+ `shabox-blog-api`(`validPassword` 升级)。
> 风格基准:**Album / About**——终端页(`views/account/`)内联 `inner+h1+MottoHeader`,引入 `widgets/` 卡片。**不用嵌套路由 / admin 式 layout;不用全局 `.auth-*`。**

## 为什么是四个终端页,不是一个页装四表单切换

账户四表单(登录/注册/忘记/重置)是**互斥的独立流程**——同屏只一个,且线性走完就跳走(注册→登录、忘记→重置)。这和 About「一页并存四张卡」(TimeProbe+QuoteCard+QrCard+UpdateLog)本质不同:

- About 的卡是**并存展示**(关于页同时摆四张,供浏览)→ 一个终端页引入多个 widget 合理。
- 账户表单是**互斥流程**(四选一,走完即离)→ 四个独立终端页,各自一个 URL。

独立 URL 的价值:① 从 profile 拦截跳来带 `?redirect=`,登录后回原页;② 每步能刷新/后退;③ 四套表单状态天然隔离,不互相污染。

> 一个终端页 + tab 切换四组件**技术可行**,但丢掉上述三点 + 动线不合,不推荐。

## 位置:views/account/ 文件夹收纳

四个终端页 + Profile 同属 account 领域,用 `views/account/` 统一收纳(Profile 已在此)。不散到 views/ 根。

---

## Step 0 — 清理 + 建 AuthPanel widget

### 0A. 撤 index.css 的 `.auth-*`(已加进去,要撤)

`src/assets/index.css` 末尾这块(行 121-124)整段删:

```css
/* 账户页:居中舞台 + 表单卡 + 标题(配合全局 .side-card 用) */
.auth-stage { display: flex; justify-content: center; padding: 40px 0; }
.auth-panel { width: 360px; padding: 24px; }
.auth-heading { text-align: center; margin: 0 0 16px; }
```

→ 搬进 0C 的 AuthPanel `<style scoped>`。

### 0B. 删 `components/layout/AuthLayout.vue`

上一轮误建的(admin 式嵌套路由方向),本轮被 AuthPanel widget 取代。删掉,确认无残留 import(现状 router 是平级路由,没引它,删了不影响)。

### 0C. 建 `components/widgets/AuthPanel.vue`

和 AlbumSection / TimeProbe / UserPanel 同级——一个可复用的表单卡 widget:

```vue
<template>
  <div class="auth-stage">
    <div class="auth-panel side-card">
      <h2 class="auth-heading">{{ title }}</h2>
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({ title: { type: String, required: true } });
</script>

<style scoped>
/* 只账户四页用,scoped 在 widget,不进全局 index.css;配合全局 .side-card */
.auth-stage {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}
.auth-panel {
  width: 360px;
  padding: 24px;
}
.auth-heading {
  text-align: center;
  margin: 0 0 16px;
}
</style>
```

> - `.auth-panel` 挂全局 `.side-card`(卡片质感)+ scoped 宽/内边距,共存没问题。
> - `width:360 + padding:24` 合计 360px(`reset.css` 全局 `box-sizing:border-box`)。
> - slot 放表单;表单里的字段样式(`.err`/`.links` 等)归各终端页 scoped(AuthPanel 管不到 slot 内容)。
> - 判据修正:站点的 `widgets/`(QrCard/QuoteCard/TimeProbe)全是「可复用 + 独立语义 + 样式封装」的卡片,有无重逻辑不决定该不该组件化。AuthPanel 同类 → 该进 widgets/。

### 0D. router 不用改

现状已是四条平级独立路由(`/account/login` 等,`router/index.js` 行 72-95),正是要的。**不要改成嵌套**,保持平级。

---

## Step 1 — Register 终端页 + 后端密码复杂度

### 1A. `src/views/account/Register.vue`(内联终端页 + AuthPanel)

> SMTP 已可用 → 保留邮箱验证码;昵称自动 roll(用 [[03-name-bank]]),不手填。
> 外壳内联(Album 风格),表单卡用 AuthPanel widget,字段样式本页 scoped。

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
          <p class="field-hint" :class="{ ok: passwordValid }">
            {{ passwordValid ? "密码强度 OK ✓" : "需包含大写、小写、数字,至少 8 位" }}
          </p>
        </el-form-item>

        <el-form-item label="你的称呼">
          <div class="name-row">
            <span class="rolled-name">{{ form.displayName || "—" }}</span>
            <el-button :disabled="loading" @click="rerollName">换一个 🎲</el-button>
          </div>
          <p class="field-hint">系统随机起名,之后可在账户里改</p>
        </el-form-item>

        <el-button
          type="primary"
          :loading="loading"
          :disabled="!canSubmit"
          native-type="submit"
          style="width: 100%"
        >注册</el-button>
      </el-form>

      <p v-if="error" class="err">{{ error }}</p>
      <p v-if="info" class="info">{{ info }}</p>
      <div class="links">
        <router-link to="/account/login">已有账户?登录</router-link>
      </div>
    </AuthPanel>
  </div>
</template>

<script setup>
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
/* 字段级样式,只本页用;表单卡外壳靠 AuthPanel widget */
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
.field-hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--text-muted, #909399);
}
.field-hint.ok {
  color: #67c23a;
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
  margin-top: 12px;
  font-size: 13px;
  text-align: center;
}
.links a {
  color: #2563eb;
  text-decoration: none;
}
</style>
```

> store / API 不用改:`userStore.register({ email, password, code, displayName })` 原本就收 displayName。

### 1B. 后端 — 密码复杂度(集中改 validPassword)

> 仓库:`shabox-blog-api`,文件 `src/routes/account.js`。
> register(行 139)和 reset(行 266)都调 `validPassword`,只改这一个函数 + 两条报错,两处自动覆盖。

**改 1 — `validPassword`(行 20-22)**

改前:
```js
function validPassword(p) {
  return typeof p === "string" && p.length >= 8 && p.length <= 128;
}
```
改后:
```js
const PASSWORD_RE = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/;
function validPassword(p) {
  return typeof p === "string" && PASSWORD_RE.test(p);
}
```

**改 2 — register 报错(行 140)**

改前:`return res.status(400).json({ message: "密码至少 8 位" });`
改后:`return res.status(400).json({ message: "密码需包含大小写字母和数字,至少 8 位" });`

**改 3 — reset 报错(行 267)**

改前:`return res.status(400).json({ message: "密码至少 8 位" });`
改后:`return res.status(400).json({ message: "密码需包含大小写字母和数字,至少 8 位" });`

> 前后端 PASSWORD_RE 同源(都 `(?=.*[a-z])(?=.*[A-Z])(?=.*\d)` + `{8,128}`)。

---

## Step 2 — Login 终端页

> 邮箱 + 密码 → `userStore.login(email, password)` → 成功 `router.replace(route.query.redirect || "/")`。
> 无验证码、无昵称、无复杂度提示(登录不前端校验,交给后端)。

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

      <p v-if="error" class="err">{{ error }}</p>
      <div class="links">
        <router-link to="/account/register">没有账户?注册</router-link>
        <router-link to="/account/forgot">忘记密码</router-link>
      </div>
    </AuthPanel>
  </div>
</template>

<script setup>
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

<style scoped>
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
```

---

## Step 3 — Forgot / Reset 终端页

### 3A. `Forgot.vue`(邮箱 + 发送重置码,60s 倒计时)

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

      <p v-if="info" class="info">{{ info }}</p>
      <p v-if="error" class="err">{{ error }}</p>
      <div class="links">
        <router-link to="/account/reset">已收到码?去重置</router-link>
        <router-link to="/account/login">返回登录</router-link>
      </div>
    </AuthPanel>
  </div>
</template>

<script setup>
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

<style scoped>
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
```

### 3B. `Reset.vue`(邮箱 + 验证码 + 新密码,套复杂度校验)

> 新密码加实时复杂度提示,与 Register / 后端 validPassword 同源(旧版只有占位文字)。1.2s 跳转定时器加 onUnmounted 清理。

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
          <p class="field-hint" :class="{ ok: passwordValid }">
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

      <p v-if="error" class="err">{{ error }}</p>
      <p v-if="ok" class="info">密码已重置,即将跳转登录…</p>
      <div class="links">
        <router-link to="/account/login">返回登录</router-link>
        <router-link to="/account/forgot">没收到码?重发</router-link>
      </div>
    </AuthPanel>
  </div>
</template>

<script setup>
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

<style scoped>
.field-hint {
  margin: 6px 0 0;
  font-size: 12px;
  color: var(--text-muted, #909399);
}
.field-hint.ok {
  color: #67c23a;
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
```

---

## 字段级样式(.err/.info/.links/.field-hint/.code-row/...)为什么留各终端页 scoped?

四页的 `.err/.info/.links` 字面重复,看似该 DRY。但**三个位置都不合适,只能留各终端页 scoped**:

- **不能进 index.css**:泛名(`.err`/`.info`)全局化后,任何页面写 `<p class="err">` 都被命中,污染命名空间。
- **不能进 AuthPanel 的 scoped**:scoped 只作用在 AuthPanel **自己模板**的元素(带它的 hash);表单是 slot 传入的,另一套 hash,AuthPanel 够不着。要用就得 `:deep()`,破坏封装。
- **留各终端页 scoped**:每页十几行,scoped 隔离互不影响。DRY 收益对不上冲突排查成本。

> 想要 DRY 的正确时机:下轮视觉定调时,把这些改名为 `.auth-err`/`.auth-info`/`.auth-links`/`.auth-hint` 后**全局**进 index.css(带前缀就不污染)。当前先把骨架跑通,不急。

---

## 后端接口评估:已标准且安全,不重构

读了 `shabox-blog-api/src/routes/account.js`,这套访客认证是**生产级标准**,该有的安全实践都在:

- **双 token**:access(短)+ refresh(httpOnly cookie,7d),JWT `type` 字段把访客(`user_access`/`user_refresh`)和 admin 隔离,共用密钥也不互认。
- **防枚举**:`send-code` 对已注册邮箱静默成功不发码;`forgot` 无论邮箱是否存在都返回成功。
- **限频**:`assertCanSend` + 429。
- **验证码分 purpose**:register / reset 各自的码池,`consumeCode` 校验。
- **改密吊销 session**:reset 成功后 `deleteMany` 该用户所有 session,强制重登。
- **formatUser 不泄密**:只返 id/email/displayName/emailVerified/createdAt。

**结论:不重构。** 改它只会引入回归风险,不带收益——这本身就是长远规范(不制造无谓 churn)。本轮后端唯一改动是 Step 1B 的 `validPassword` 升级(功能需求,非重构)。

> store(`userStore.login/forgot/reset/register/sendCode`)和 `api/account.js` 方法签名一字不动,终端页照原样调。

---

## 落地后我会审的点

- **index.css**:`.auth-stage/.auth-panel/.auth-heading` 三行已删,全局只剩 `.inner/.visually-hidden/.side-card` 等全站类。
- **AuthLayout 已删**:`components/layout/AuthLayout.vue` 不在了,router 没引它。
- **AuthPanel widget**:`components/widgets/AuthPanel.vue` 在,和 AlbumSection/UserPanel 同级;四终端页都 `<AuthPanel title="X">` 包表单;标题随页变。
- **router**:保持平级独立路由(`/account/login` 等),没改成嵌套;`?redirect=` 仍生效。
- **终端页结构**:四页都内联 `inner + h1 + MottoHeader + AuthPanel`(Album 同款);MottoHeader 返回键/诗句/昼夜开关正常。
- **注册**:进页自动 roll 昵称;「换一个」刷新;密码实时变绿;`canSubmit` 把关;弱密码被后端拒并返新文案。
- **登录**:字段空时按钮禁用;登录成功走 `redirect` 参数;错误回显。
- **忘记/重置**:倒计时正常且离开页面清理;Reset 新密码实时复杂度;成功后 1.2s 跳登录且定时器清理。
- **后端**:弱密码(`abcdefgh`)被拒、强密码(`Abc12345`)通过;register + reset 都生效、文案一致。

## 暂不做(更后)

- **Profile 页重设计**:登录后的全功能页(头像/资料/收藏),本轮不动,留 `views/account/Profile.vue`。
- **头像系统**(monogram 默认 + 预设图 + BOS 自定义上传)+ **签名字段**:需后端给 User 加 `avatar`/`bio` 字段 + 访客上传端点。
- **字段样式全局化**(.auth-err 等):等视觉定调连同配色一起抽。
