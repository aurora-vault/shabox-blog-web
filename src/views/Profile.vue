<template>
  <PageFrame mottoDark="🌙 此心安处" mottoLight="☀️ 归去来兮">
    <h1 class="visually-hidden">我的主页 - 沙盒屋</h1>

    <div class="profile-page">
      <!-- ============ 左栏:用户卡片栈 ============ -->
      <aside class="profile-left">
        <!-- 卡片 1:用户信息(头像+名称 → ID+等级+徽章 → 签名 → 计数) -->
        <section class="card">
          <div class="card-body">
            <!-- 第一行:头像 + 名称(底边齐平) -->
            <div class="user-head-row">
              <div class="avatar">像</div>
              <h2 class="user-name">
                {{ userStore.user?.displayName || "像素人" }}
              </h2>
            </div>
            <!-- 第二行:自定义ID + 系统ID + 等级 + 徽章 -->
            <div class="user-meta-row">
              <span class="uid">@pixman</span>
              <span class="sid">#100001</span>
              <span class="lv">Lv.9</span>
              <span class="medal">✦ 创作者</span>
              <span class="medal">❧ 园丁</span>
              <span class="medal">✎ 笔耕</span>
            </div>
            <!-- 第三行:个性签名 -->
            <p class="user-bio">
              在自己的节奏里生活，也在理解沿途的许多事情。
            </p>
          </div>
          <!-- 第四行:粉丝 / 贡献 / 成就 / 获赞 -->
          <div class="stat-grid">
            <div class="stat-cell"><div class="stat-num">128</div><div class="stat-label">粉丝</div></div>
            <div class="stat-cell"><div class="stat-num">47</div><div class="stat-label">贡献</div></div>
            <div class="stat-cell"><div class="stat-num">12</div><div class="stat-label">成就</div></div>
            <div class="stat-cell"><div class="stat-num">1.0k</div><div class="stat-label">获赞</div></div>
          </div>
        </section>

        <!-- 卡片 2:互动 -->
        <section class="card">
          <div class="card-body">
            <h3 class="card-title">互动</h3>
            <div class="link-grid">
              <div class="link-cell"><div class="link-num">36</div><div class="link-label">好友</div></div>
              <div class="link-cell"><div class="link-num">88</div><div class="link-label">关注</div></div>
              <div class="link-cell"><div class="link-num">256</div><div class="link-label">收藏</div></div>
              <div class="link-cell"><div class="link-num">512</div><div class="link-label">浏览</div></div>
            </div>
            <!-- 自定义外链:可多行多扩展 -->
            <div class="ext-links">
              <div class="ext-link">🔗 github.com/pixman</div>
              <div class="ext-link">📧 pixman@shabox.fun</div>
              <div class="ext-link">🌐 shabox.fun</div>
            </div>
          </div>
        </section>

        <!-- 卡片 3:足迹 -->
        <section class="card">
          <div class="card-body">
            <h3 class="card-title">足迹</h3>
            <div class="meta-line">
              <span class="k">加入时长</span>
              <span class="v">已漫步 1788 天</span>
            </div>
            <div class="meta-line">
              <span class="k">常用工具</span>
            </div>
            <div class="tool-chips">
              <span class="chip">🍅 番茄钟</span>
              <span class="chip">🏷 标签工坊</span>
              <span class="chip">🖼 图床</span>
              <span class="chip">📊 看板</span>
            </div>
          </div>
        </section>

        <!-- 卡片 4:账户(改密 + 退出) -->
        <section class="card">
          <div class="card-body">
            <h3 class="card-title">账户</h3>
            <div class="action-row">
              <button class="btn ghost" @click="goForgot">修改密码</button>
              <button
                class="btn danger"
                :disabled="loggingOut"
                @click="onLogout"
              >
                {{ loggingOut ? "退出中…" : "退出登录" }}
              </button>
            </div>
          </div>
        </section>
      </aside>

      <!-- ============ 右栏:动态/发布 + 内容流(占位) ============ -->
      <section class="card profile-right">
        <nav class="tabs">
          <div class="tab active">动态</div>
          <div class="tab">发布</div>
        </nav>
        <div class="feed">
          <article class="feed-item">
            <div class="feed-top">
              <span class="feed-act">发布了文章</span>
              <span class="feed-date">2026-07-26</span>
            </div>
            <h4 class="feed-title">我的第一篇 Markdown 日记</h4>
            <p class="feed-excerpt">
              沙盒推演：逐步雕琢，为这座城堡重塑更坚固的现代代码骨架……
            </p>
            <div class="feed-tags"><span>随笔</span><span>前端</span></div>
          </article>
          <article class="feed-item">
            <div class="feed-top">
              <span class="feed-act">更新了标签</span>
              <span class="feed-date">2026-07-25</span>
            </div>
            <h4 class="feed-title">整理碎影：收纳实用的软件与漫游指南</h4>
            <p class="feed-excerpt">
              把零碎的思绪与灵感停泊在这里，记录光阴，写下技术探索的足迹。
            </p>
            <div class="feed-tags"><span>造物</span><span>工具</span></div>
          </article>
          <article class="feed-item">
            <div class="feed-top">
              <span class="feed-act">获得了徽章</span>
              <span class="feed-date">2026-07-20</span>
            </div>
            <h4 class="feed-title">❧ 园丁 —— 持续打理精神自留地</h4>
            <p class="feed-excerpt">
              皆因兴趣而生，无任何商业沾染。偶尔会停泊在这里，围炉夜话。
            </p>
            <div class="feed-tags"><span>成就</span></div>
          </article>
        </div>
      </section>
    </div>
  </PageFrame>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "@/store/user.js";

const userStore = useUserStore();
const router = useRouter();

// 守卫:SSG 不预渲染此页;刷新后 store 可能空 → fetchMe 拉取,401 则回登录
onMounted(async () => {
  if (!userStore.user) {
    const u = await userStore.fetchMe();
    if (!u) {
      router.replace({ path: "/account", query: { mode: "login", redirect: "/profile" } });
      return;
    }
  }
});

// ===== 退出登录(已实装) =====
const loggingOut = ref(false);
async function onLogout() {
  loggingOut.value = true;
  try {
    await userStore.logout();
  } finally {
    loggingOut.value = false;
    router.replace("/");
  }
}

// 修改密码:跳忘记密码流程(已实装)
function goForgot() {
  router.push({ path: "/account", query: { mode: "forgot" } });
}
</script>

<style scoped>
/* ========================================= */
/* 两栏布局:左栏卡片栈 / 右栏内容流 */
/* ========================================= */
.profile-page {
  display: grid;
  grid-template-columns: 340px 1fr;
  gap: 20px;
  align-items: start;
}
.profile-left {
  display: flex;
  flex-direction: column;
  gap: 20px;
}
@media (max-width: 900px) {
  .profile-page {
    grid-template-columns: 1fr;
  }
}

/* ========================================= */
/* 卡片外壳 —— 对齐 GlassCard 基准 */
/* (bg-card + box-shadow 0 2px 8px + radius 10 + 过渡 0.4s) */
/* ========================================= */
.card {
  background-color: var(--bg-card);
  color: var(--text-main);
  box-shadow: 0 2px 8px var(--card-shadow);
  border-radius: 10px;
  transition: background-color 0.4s ease, color 0.4s ease, box-shadow 0.4s ease;
}
.card-body {
  padding: 20px;
}
/* 卡片标题 —— 对齐 GlassCard h2(居中 + 下边框) */
.card-title {
  font-size: 20px;
  font-weight: bold;
  text-align: center;
  line-height: 40px;
  border-bottom: 2px solid var(--border-color);
  margin: 0 0 15px;
  transition: border-color 0.4s ease;
}

/* ========================================= */
/* 卡片 1:用户信息 */
/* ========================================= */
/* 第一行:头像 + 名称,底边齐平 */
.user-head-row {
  display: flex;
  align-items: flex-end;
  gap: 14px;
}
.avatar {
  width: 72px;
  height: 72px;
  flex-shrink: 0;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 30px;
  font-weight: bold;
  color: #fff;
  background: linear-gradient(145deg, #80c934, #56ab2f);
  /* 绿光 —— 对齐 ProfileCard 头像 */
  box-shadow:
    0 0 5px #5c7b1e,
    0 0 3px #d8ff46;
  user-select: none;
}
.user-name {
  font-size: 24px;
  font-weight: bold;
  margin: 0;
  padding-bottom: 6px;
}
/* 第二行:自定义ID + 系统ID + 等级 + 徽章 */
.user-meta-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 16px;
  font-size: 13px;
}
.uid {
  color: var(--green, #56ab2f);
  font-weight: bold;
}
.sid {
  color: var(--text-muted);
}
.lv {
  font-size: 12px;
  font-weight: bold;
  color: #fff;
  background: linear-gradient(145deg, #f0a500, #e6a23c);
  padding: 1px 8px;
  border-radius: 10px;
}
.medal {
  font-size: 11px;
  color: var(--text-main);
  border: 1px solid var(--border-color);
  padding: 2px 8px;
  border-radius: 6px;
  background: var(--poem-bg, rgba(0, 0, 0, 0.02));
}
/* 第三行:个性签名(楷体) */
.user-bio {
  margin: 14px 0 0;
  font-family: "KaiTi", "楷体", serif;
  font-size: 14px;
  line-height: 1.8;
  color: var(--text-muted);
  letter-spacing: 1px;
}
/* 第四行:粉丝 / 贡献 / 成就 / 获赞 */
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1px;
  background: var(--border-color);
  border-top: 1px solid var(--border-color);
}
.stat-cell {
  background: var(--bg-card);
  padding: 14px 4px;
  text-align: center;
  transition: background 0.3s ease;
}
.stat-cell:hover {
  background: var(--poem-bg, rgba(0, 0, 0, 0.02));
}
.stat-num {
  font-size: 18px;
  font-weight: bold;
  color: #56ab2f;
}
.stat-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}

/* ========================================= */
/* 卡片 2:互动 */
/* ========================================= */
.link-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 10px;
}
.link-cell {
  text-align: center;
  padding: 14px 4px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--poem-bg, rgba(0, 0, 0, 0.02));
}
.link-cell:hover {
  border-color: #56ab2f;
  transform: translateY(-2px);
}
.link-num {
  font-size: 16px;
  font-weight: bold;
}
.link-label {
  font-size: 12px;
  color: var(--text-muted);
  margin-top: 2px;
}
/* 自定义外链:可多行多扩展 */
.ext-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
}
.ext-link {
  padding: 8px 12px;
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  font-size: 13px;
  color: var(--text-muted);
  cursor: pointer;
  transition: all 0.3s ease;
}
.ext-link:hover {
  border-color: #56ab2f;
  color: var(--text-main);
}

/* ========================================= */
/* 卡片 3:足迹 */
/* ========================================= */
.meta-line {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  font-size: 14px;
  border-bottom: 1px solid var(--border-color);
}
.meta-line:last-child {
  border-bottom: none;
}
.meta-line .k {
  color: var(--text-muted);
}
.meta-line .v {
  font-weight: bold;
}
.tool-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
}
.chip {
  font-size: 13px;
  padding: 6px 12px;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--poem-bg, rgba(0, 0, 0, 0.02));
}
.chip:hover {
  border-color: #56ab2f;
  color: #56ab2f;
}

/* ========================================= */
/* 卡片 4:账户 */
/* ========================================= */
.action-row {
  display: flex;
  gap: 12px;
}
.btn {
  flex: 1;
  padding: 10px 0;
  text-align: center;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  border-radius: 8px;
  border: 1px solid var(--border-color);
  background: var(--bg-main);
  color: var(--text-main);
  transition: all 0.3s ease;
}
.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.btn.ghost {
  background: transparent;
}
.btn.ghost:hover:not(:disabled) {
  border-color: #56ab2f;
  color: #56ab2f;
}
.btn.danger {
  color: #e06c6c;
}
.btn.danger:hover:not(:disabled) {
  background: #e06c6c;
  color: #fff;
  border-color: #e06c6c;
}

/* ========================================= */
/* 右栏:tab + 内容流 */
/* ========================================= */
.profile-right {
  min-height: 400px;
}
@media (min-width: 901px) {
  .profile-right {
    position: sticky;
    top: 24px;
  }
}
.tabs {
  display: flex;
  gap: 24px;
  padding: 0 20px;
  border-bottom: 1px solid var(--border-color);
}
.tab {
  padding: 14px 0;
  font-size: 15px;
  font-weight: bold;
  color: var(--text-muted);
  cursor: pointer;
  border-bottom: 2px solid transparent;
  transition: all 0.3s ease;
}
.tab.active {
  color: #56ab2f;
  border-bottom-color: #56ab2f;
}
.feed {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.feed-item {
  padding: 16px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--poem-bg, rgba(0, 0, 0, 0.02));
}
.feed-item:hover {
  border-color: #56ab2f;
  box-shadow: 0 4px 14px var(--card-shadow);
}
.feed-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.feed-act {
  font-size: 13px;
  color: #56ab2f;
  font-weight: bold;
}
.feed-date {
  font-size: 12px;
  color: var(--text-muted);
}
.feed-title {
  font-size: 16px;
  font-weight: bold;
  margin: 8px 0 6px;
}
.feed-excerpt {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.6;
  margin: 0;
}
.feed-tags {
  display: flex;
  gap: 6px;
  margin-top: 10px;
}
.feed-tags span {
  font-size: 11px;
  padding: 2px 8px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
}
</style>
