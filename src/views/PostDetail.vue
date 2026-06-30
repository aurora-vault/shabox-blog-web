<template>
  <div class="inner">
    <MottoHeader
      :showBack="true"
      darkText="🌙 月光入梦"
      lightText="☀️ 日暮浅眠"
    />

    <div class="content" v-if="currentPost">
      <h1 class="title">
        {{ currentPost.title }}
      </h1>
      <p class="date">
        {{ currentPost.date }}
      </p>
      <p class="preface">
        {{ currentPost.quote }}
      </p>

      <div class="article" v-html="currentPost.contentHtml"></div>
    </div>

    <div class="content not-found" v-else-if="isLoading">
      <h1 class="title">文章内容正在加载中...</h1>
    </div>

    <div class="content not-found" v-else>
      <h1 class="title">哎呀，找不到这篇帖子了...</h1>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch, watchEffect } from "vue";
import { useRoute } from "vue-router";
import MottoHeader from "@/components/layout/MottoHeader.vue";
import { useHead } from "@unhead/vue"; // 1. 引入新版 Head 管理器
import { useBlogStore } from "@/store/blog.js";

const route = useRoute();
const blogStore = useBlogStore();

const currentPost = computed(() => {
  return blogStore.postDetails[route.params.id] || null;
});

const isLoading = computed(() =>
  Boolean(blogStore.loadingPostIds[route.params.id]),
);

async function loadPost() {
  try {
    await blogStore.ensurePostDetail(route.params.id);
  } catch (_error) {
    // 404 和接口错误由页面状态兜底
  }
}

onMounted(loadPost);
watch(() => route.params.id, loadPost);

// 👇 2. 动态注入 SEO 魔法：监听当前文章数据的变化
watchEffect(() => {
  if (currentPost.value) {
    useHead({
      // 将页面标题变成 "文章标题 - 沙盒屋"
      title: `${currentPost.value.title} - 沙盒屋`,
      meta: [
        {
          name: "description",
          // 巧妙利用你 Markdown 里的 quote 作为 SEO 的描述摘要
          content: currentPost.value.quote || "像素人的沙盒屋文章详情",
        },
      ],
      // 👇 新增：防御 URL 参数导致的权重流失
      link: [
        {
          rel: "canonical",
          // 动态拼接出纯净的绝对路径
          href: `https://shabox.fun/post/${currentPost.value.id}`,
        },
      ],
    });
  }
});
</script>

<style scoped>
/* ========================================= */
/* 全局页面结构基础 */
/* ========================================= */

/* 炫酷的渐变大标题（保留你的得意之作） */
.title {
  width: 100%;
  font-size: 25px;
  line-height: 60px;
  font-weight: bold;
  text-align: center;
  /* 魔法 1：边框颜色跟随昼夜变化 */
  border-top: 2px solid var(--text-main);
  border-bottom: 2px solid var(--text-main);
  /* 极其重要：因为背景永远是亮黄/亮绿，所以文字【必须】永远是深色，否则黑夜模式下白字+亮黄底会瞎眼！ */
  color: #222 !important;
  transition: border-color 0.4s ease;
  border-radius: 0 20px;
  background: linear-gradient(
    to right,
    rgba(191, 227, 62, 0.87),
    rgba(240, 255, 78, 0.87)
  );
  box-shadow:
    5px 5px 10px rgba(191, 227, 62, 0.87),
    -5px -5px 10px rgba(240, 255, 78, 0.87);
  margin-bottom: 15px;
}

/* ========================================= */
/* 【需求 2】辅助信息聚合：日期、副标题、图片题注 */
/* 统一使用小字号、浅灰色，弱化视觉存在感 */
/* ========================================= */
.date,
.preface,
.article :deep(blockquote) {
  color: var(--text-muted); /* 优雅的高级灰 */
  font-size: 14px;
}

.date {
  text-align: right;
  margin-bottom: 5px;
}
.preface {
  line-height: 20px;
  text-indent: 2em;
  white-space: pre-line;
}

/* 专门照顾图片下方的题注 */
.article :deep(blockquote) {
  margin: auto auto 20px auto; /* 上间距极小，与图片紧贴 */
  text-align: center;
  padding: 0;
  border: none; /* 消除 blockquote 默认的左侧竖线 */
  background: transparent;
}
/* 解决你发现的 > 里包着 p 标签导致变黑、缩进的 Bug */
.article :deep(blockquote p) {
  color: #999;
  text-indent: 0;
  margin: 0;
}
/* ========================================= */
/* 极客暗号魔法：专门识别 alt="icon" 的小图标 */
/* ========================================= */
.article :deep(img[alt="icon"]) {
  display: inline-block; /* 极其核心：解除霸道的独占一行，允许和文字并排！ */
  width: 24px; /* 强制缩小为精致的 Icon 尺寸 (可根据喜好微调) */
  height: 24px;
  margin: 0 8px 0 0; /* 消除上下居中边距，只在右侧留一点空隙和文字隔开 */
  box-shadow: none; /* 去掉大图那沉重的阴影 */
  border-radius: 4px; /* 稍微给个微小的圆角 */
  vertical-align: middle; /* 极其重要：让图标和旁边的文字在一条水平线上绝对居中！ */
}

/* ========================================= */
/* 核心文章区域及语义化标签 */
/* ========================================= */
.article {
  width: 100%;
  margin-top: 15px;
  padding: 15px 4%;
  border-radius: 10px;
  background-color: var(--article-bg);
  box-shadow: 5px 5px 0px var(--article-shadow);
  transition:
    background-color 0.4s ease,
    box-shadow 0.4s ease;
}

/* 基础段落与加粗文字 */
.article :deep(p),
.article :deep(strong),
.article :deep(h3) {
  color: var(--text-main); /* 换成魔法代词 */
  transition: color 0.4s ease;
} /* 基础段落 */
/* ========================================= */
/* 极客魔法：大标题紧跟的小灰字副标 */
/* ========================================= */
.article :deep(h3 small) {
  font-size: 14px; /* 字体缩小 */
  color: var(--text-muted); /* 变成优雅的高级灰 */
  font-weight: normal; /* 取消加粗，和主标题形成强烈对比 */
  margin-left: 8px; /* 往右边稍微推一点，拉开呼吸感 */
}

.article :deep(p) {
  font-size: 18px;
  text-indent: 2em;
  line-height: 1.8;
  margin-bottom: 15px;
}

/* 保留文字加粗（忠于 strong 的本职工作） */
.article :deep(strong) {
  font-weight: bold;
}

/* 【需求 1】段落标题：使用 h3 标签 */
/* 带有极具现代感的主题色左边框标识 */
.article :deep(h3) {
  font-size: 20px;
  font-weight: bold;
  margin-top: 25px;
  margin-bottom: 15px;
  padding-left: 10px;
  border-left: 4px solid #56ab2f;
  line-height: 1.2;
}

/* 图片自适应（保持底部距离较小，为了迎接题注） */
.article :deep(img) {
  max-width: 100%;
  border-radius: 10px;
  display: block;
  margin: 15px auto 5px auto;
  box-shadow: 0 4px 8px var(--card-shadow);
  transition: box-shadow 0.4s ease;
}
/* 现代魔法：精准打击“包裹着图片的 p 标签” */
.article :deep(p:has(img)) {
  margin-bottom: 0; /* 把它那多余的 15px 底部空隙直接抹杀！ */
}

/* 【需求 3】废弃文字与原价：带有删除线的 s 标签 */

/* 同时兼容 s 和旧版 del */
.article :deep(s),
.article :deep(del) {
  text-decoration: line-through;
  color: #a0a0a0;
}
.article :deep(s),
.article :deep(del),
.article :deep(blockquote p) {
  color: var(--text-muted);
  transition: color 0.4s ease;
}

/* 【需求 4】现代链接设计（替代旧版的棕色斜体） */
.article :deep(a) {
  color: #56ab2f; /* 使用你的主题绿 */
  text-decoration: none;
  border-bottom: 1px dashed #56ab2f; /* 底部虚线暗示可点击 */
  transition: all 0.3s ease;
  margin: 0 2px;
}
.article :deep(a):hover {
  color: #3e8e21;
  border-bottom-style: solid; /* 悬停时变成实线 */
}

/* 【需求 5】超级高亮战袍：<mark> 标签 */
/* 完美包裹文字、且不会影响里面的删除线 */
.article :deep(mark) {
  display: inline-block;
  border-radius: 4px;
  color: #a4d007;
  background-color: #4c6b22;
  padding: 2px 8px;
  font-size: 14px;
  font-weight: bold;
  /* 重置 mark 默认的黄色背景和黑字 */
}
/* 微调 mark 内部的删除线颜色，使其在绿底色上看得清 */
.article :deep(mark s) {
  color: #8dae17;
}

/* 单行代码的高级换肤 */
.article :deep(code) {
  background-color: var(--inline-code-bg);
  color: var(--inline-code-color);
  padding: 2px 6px;
  border-radius: 4px;
  font-family: monospace;
  margin: 0 4px;
  transition:
    background-color 0.4s ease,
    color 0.4s ease;
}

/* ========================================= */
/* 【需求 6】古诗词/居中文本的“书卷气”外衣 */
/* ========================================= */
.article :deep(.poem) {
  text-align: center; /* 整体居中 */
  margin: 25px auto; /* 上下留出较大的呼吸空间 */
  padding: 20px;
  border-radius: 8px;
  background-color: var(--poem-bg);
  border: 1px solid var(--border-color);
  transition:
    background-color 0.4s ease,
    border-color 0.4s ease;
}

/* 针对诗词内部的文字做精确打击 */
.article :deep(.poem p) {
  font-family: "KaiTi", "楷体", serif; /* 魔法：瞬间充满古典文学气息 */
  font-weight: bold; /* 加上这句，诗词瞬间变得厚重有力 */
  font-size: 20px; /* 诗词字号可以稍微大一点点 */
  color: var(--text-main);
  transition: color 0.4s ease;
  text-indent: 0; /* 核心：彻底干掉首行缩进，保证绝对居中！ */
  margin-bottom: 0;
  line-height: 2; /* 行高拉大，增加留白美感 */
}
/* 工具类：专门用来消除首行缩进 */
.article :deep(.no-indent) {
  text-indent: 0 !important;
}

/* ========================================= */
/* PC 端响应式 */
/* ========================================= */
@media (min-width: 768px) {
  .inner {
    width: 60%;
  }
}
</style>
