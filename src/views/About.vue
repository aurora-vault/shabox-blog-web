<template>
  <PageFrame mottoDark="🌙 宁静致远" mottoLight="☀️ 不忘初心">
    <h1 class="visually-hidden">ShaBox - 像素人的个人博客与代码沙盒</h1>

    <div class="about-layout">
      <ProfileCard class="side-card area-profile" />

      <div class="info-cards-row area-info">
        <GlassCard
          class="area-about"
          title="关于本站"
          :bgImage="`${__CDN__}/@system/bg/hs.webp`"
          watermark="❝"
        >
          <p class="id-card">
            - 👋 你好！<br />
            - 我是像素人。<br />
            一个在慢慢靠近自己的人；<br />
            在自己的节奏里生活，也在理解沿途的许多事情；<br />
            一些零碎的思绪与灵感，偶尔会停泊在这里。
          </p>
          <p>
            <strong>沙盒推演：</strong><br />
            <strong>逐</strong
            >步雕琢，为这座城堡重塑更坚固的现代代码骨架；<br />
            <strong>整</strong>理碎影，收纳实用的软件、网站与漫游指南；<br />
            <strong>记</strong>录光阴，写下技术探索的足迹与深夜的沉思；<br />
            <em>PS：</em
            >也许有一天，这里会成为我们在赛博世界里围炉夜话的小小天地。
          </p>
        </GlassCard>

        <GlassCard
          class="area-notice"
          title="公告"
          :bgImage="`${__CDN__}/@system/bg/cj1.webp`"
          watermark="✦"
        >
          <p>本站自 <strong>2021.9.1</strong> 破土动工并上线。</p>
          <p>
            这里是由
            <strong>像素人</strong>
            独自打理的精神自留地。用于记录日常、沉淀内容以及分享些许个人造物；皆因兴趣而生，无任何商业沾染。
          </p>
          <p>
            这座沙盒建立在自费的微型服务器上，因同时承载着别的游戏世界，偶尔可能会“打个小盹”出现卡顿，还请访客朋友多加包涵。
          </p>
          <p>
            目前，这片领地仍在无声地生长与完善中。如对这里的风景或建筑有任何奇思妙想，随时欢迎通过左侧的联系方式与我碰杯交流。
          </p>
        </GlassCard>
      </div>

      <TimeProbe class="side-card area-time" />

      <QuoteCard class="side-card area-quote" />

      <QrCard class="side-card area-qr" />

      <UpdateLog class="side-card area-log" />
    </div>
  </PageFrame>
</template>

<script setup>
import { useRouter } from "vue-router";
import PageFrame from "@/components/layout/PageFrame.vue";
import ProfileCard from "@/components/widgets/ProfileCard.vue";
import TimeProbe from "@/components/widgets/TimeProbe.vue";
import QuoteCard from "@/components/widgets/QuoteCard.vue";
import UpdateLog from "@/components/widgets/UpdateLog.vue";
import QrCard from "@/components/widgets/QrCard.vue";
import GlassCard from "@/components/common/GlassCard.vue";

const $router = useRouter();
</script>

<style scoped>
/* ========================================= */
/* 移动端优先：单列瀑布流排列 */
/* ========================================= */
.about-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 所有卡片的基础换肤魔法 */
.side-card,
.info-card,
.qr-card {
  background-color: var(--bg-card);
  color: var(--text-main);
  box-shadow: 0 2px 8px var(--card-shadow);
  border-radius: 10px;
  overflow: hidden;
  transition:
    background-color 0.4s ease,
    color 0.4s ease,
    box-shadow 0.4s ease;
}

.info-cards-row {
  display: flex;
  flex-direction: column;
  gap: 20px; /* 👈 就是这句魔法，解决了手机端没有边距的问题！ */
}

/* ========================================= */
/* PC 端上帝视角：上帝拼图排版法则 */
/* ========================================= */
@media (min-width: 992px) {
  .about-layout {
    display: grid;
    /* 划时代魔法：划分为绝对均等的 3 列 */
    grid-template-columns: repeat(3, 1fr);
    gap: 20px;
    align-items: stretch; /* 让同一行的卡片高度自动拉齐 */

    /*
       魔法阵法图：在这里画出你的排版蓝图！
       哪怕 HTML 里的顺序是乱的，只要在这里排好了，浏览器就会乖乖听话！
    */
    grid-template-areas:
      "profile info   info" /* 👈 让 info（二儿子）一个人霸占右边的两个格子！ */
      "time    quote  qr    "
      "log     log    log   ";
  }
  /* 唤醒 PC 端的并排魔法！ */
  .info-cards-row {
    display: flex;
    flex-direction: row; /* 强制横向排列 */
    justify-content: space-between;
    height: 100%; /* 撑满 Grid 分配给它的高度 */
  }

  /* 核心修复：直接掌控里面的两个 GlassCard，让它们各占 48% */
  .info-cards-row > * {
    width: 48%;
    margin-bottom: 0; /* 消除自带的底部间距，保持底部齐平 */
  }
  /* 把各个卡片“对号入座”填进阵法里 */
  .area-profile {
    grid-area: profile;
  }
  .area-info {
    grid-area: info;
  } /* 👈 告诉系统，二儿子就是 info！ */
  .area-time {
    grid-area: time;
  }
  .area-quote {
    grid-area: quote;
  }
  .area-qr {
    grid-area: qr;
  }
  .area-log {
    grid-area: log;
  }
}
</style>
