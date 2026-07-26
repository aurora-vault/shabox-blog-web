<!-- # 我的空间小组件(读者面板·轻量双态) -->
<template>
  <div class="user-panel">
    <div class="card-title">我的空间</div>

    <!-- ▼ 未登录:引导卡 -->
    <div v-if="!userStore.isAuthed" class="panel-body guest">
      <p class="guest-hint">登录后可同步你的点赞、收藏与足迹</p>
      <router-link :to="{ path: '/account/login' }" class="guest-cta">
        登录 / 注册
      </router-link>
    </div>

    <!-- ▼ 已登录:轻量身份面板 -->
    <div v-else class="panel-body authed">
      <div class="head-row">
        <div class="avatar">{{ initial }}</div>
        <div class="greet">
          <span class="hello">你好,</span>
          <strong class="name">{{ displayName }}</strong>
        </div>
      </div>

      <div class="meta">
        <div class="meta-item">
          <span>邮箱</span>
          <b class="meta-val">{{ userStore.user.email }}</b>
        </div>
        <div class="meta-item">
          <span>加入于</span>
          <b class="meta-val">{{ joinDate }}</b>
        </div>
      </div>

      <div class="soon">点赞 · 收藏 · 通知 · 敬请期待</div>

      <router-link :to="{ path: '/account/profile' }" class="to-profile">
        账户详情 →
      </router-link>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";
import { useUserStore } from "@/store/user.js";

// 只读全局 Nav 已 boot 的登录态,不重复 fetch
const userStore = useUserStore();

const displayName = computed(() => {
  const u = userStore.user;
  return u?.displayName || (u?.email ? u.email.split("@")[0] : "访客");
});

// 首字母 monogram 头像(无需后端真头像,也强化「这不是肖像名片」)
const initial = computed(() => {
  const n = displayName.value;
  return n ? n.charAt(0).toUpperCase() : "?";
});

// createdAt 由后端 formatUser 提供(ISO 字符串),格式化为 YYYY-MM-DD
const joinDate = computed(() => {
  const c = userStore.user?.createdAt;
  if (!c) return "—";
  const d = new Date(c);
  if (Number.isNaN(d.getTime())) return "—";
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
});
</script>

<style scoped>
.user-panel {
  height: 100%;
  display: flex;
  flex-direction: column;
}

/* 标题:与 PinnedCard / TimeProbe / QuoteCard 的 .card-title 完全一致 */
.card-title {
  font-size: 16px;
  font-weight: bold;
  padding: 15px 20px 10px;
  border-bottom: 1px solid var(--border-color);
  text-align: center;
}

.panel-body {
  padding: 18px 20px;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 14px;
}

/* ▼ 未登录态 */
.guest {
  align-items: center;
  justify-content: center;
  text-align: center;
}
.guest-hint {
  margin: 0;
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.7;
}
.guest-cta {
  display: inline-block;
  padding: 8px 22px;
  font-size: 14px;
  font-weight: bold;
  color: #fff;
  border-radius: 10px;
  background: linear-gradient(145deg, #80c934, #6ca92c);
  box-shadow:
    4px 4px 14px #66a02a,
    -4px -4px 14px #8ad838;
  transition: all 0.2s ease-out;
}
.guest-cta:hover {
  border-radius: 20px;
  background: linear-gradient(145deg, #6ca92c, #80c934);
}

/* ▼ 已登录态 */
.head-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.avatar {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: bold;
  color: #fff;
  background: linear-gradient(135deg, #a8e063, #56ab2f);
  box-shadow:
    0 0 5px #5c7b1e,
    0 0 3px #d8ff46;
}
.greet {
  display: flex;
  flex-direction: column;
  line-height: 1.4;
  overflow: hidden;
}
.hello {
  font-size: 12px;
  color: var(--text-muted);
}
.name {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-main);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.meta-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  font-size: 13px;
}
.meta-item span {
  color: var(--text-muted);
  flex-shrink: 0;
}
.meta-val {
  color: var(--text-main);
  font-weight: normal;
  font-family: "Consolas", monospace;
  font-size: 12px;
  text-align: right;
  overflow-wrap: anywhere; /* 长邮箱兜底换行,不撑破卡片 */
}

.soon {
  margin-top: auto;
  padding: 8px 10px;
  font-size: 12px;
  color: var(--text-muted);
  text-align: center;
  border-radius: 8px;
  background: var(--article-bg);
}

.to-profile {
  text-align: center;
  font-size: 13px;
  font-weight: bold;
  color: #56ab2f;
  transition: all 0.2s ease-out;
}
.to-profile:hover {
  transform: translateX(3px);
}
</style>
