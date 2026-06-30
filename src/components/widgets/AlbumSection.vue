<template>
  <div class="album-section" :class="{ 'is-expanded': isExpanded }">
    <div class="section-header">
      <div class="header-info">
        <span class="section-tag">{{ post.tag[0] || "日常" }}</span>
        <h2 class="section-title">{{ post.title }}</h2>
        <span class="section-date">{{ post.date }}</span>

        <button class="toggle-btn" @click="isExpanded = !isExpanded">
          {{ isExpanded ? "收起画廊" : `展开 (${post.gallery.length}张)` }}
        </button>
      </div>
      <div class="header-line"></div>
    </div>

    <div
      v-if="!isExpanded"
      class="stack-container"
      :class="{ 'has-fake-back': post.gallery.length > 3 }"
      @click="isExpanded = true"
      title="点击展开画廊"
    >
      <img
        v-for="(imgUrl, index) in post.gallery.slice(0, 3)"
        :key="index"
        :src="imgUrl"
        class="stack-img"
        :class="'stack-' + index"
        alt="stack-preview"
      />
      <div class="photo-count" v-if="post.gallery.length > 1">
        <span class="icon">📷</span> +{{ post.gallery.length }}
      </div>
    </div>

    <div v-else class="masonry-grid">
      <div
        class="masonry-item"
        v-for="(imgUrl, index) in post.gallery"
        :key="index"
        @click="
          emit('openLightbox', {
            images: post.gallery,
            index: index,
            postId: post.id,
          })
        "
      >
        <img :src="imgUrl" alt="gallery-img" loading="lazy" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";

const props = defineProps({
  post: {
    type: Object,
    required: true,
  },
});

// 控制扑克牌与瀑布流的切换
const isExpanded = ref(false);

// 在原有的 const isExpanded = ref(false) 下面加一行
const emit = defineEmits(["openLightbox"]);
</script>

<style scoped>
/* ========================================= */
/* 状态 1：收起时的“精致相册夹” */
/* ========================================= */
.album-section {
  background-color: var(--bg-card); /* 给它一个精致的底色 */
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 12px var(--card-shadow);
  transition: all 0.5s cubic-bezier(0.25, 0.8, 0.25, 1); /* 极其丝滑的物理阻尼过渡 */
}
/* ========================================= */
/* 状态 2：展开时的“全屏大画廊（越狱）” */
/* ========================================= */
.album-section.is-expanded {
  /* 👑 终极越狱魔法：从网格的第一列，强行跨越到最后一列！独占整行！ */
  grid-column: 1 / -1;

  /* 蜕去伪装，融入背景，让瀑布流成为绝对的主角 */
  background-color: transparent;
  box-shadow: none;
  padding: 20px 0; /* 释放左右空间 */

  /* 上下加一点极其优雅的分割线，与其他的相册隔开 */
  border-top: 1px dashed var(--border-color);
  border-bottom: 1px dashed var(--border-color);
  border-radius: 0;
}

/* 头部排版 */
.section-header {
  margin-bottom: 30px;
}
.header-info {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 15px;
  margin-bottom: 10px;
}
.section-tag {
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: #56ab2f;
  color: #fff;
  font-weight: bold;
}
.section-title {
  font-size: 20px;
  font-weight: bold;
  color: var(--text-main);
  margin: 0;
}
.section-date {
  font-size: 13px;
  color: var(--text-muted);
  font-family: monospace;
}

/* 精致的极客风按钮 */
.toggle-btn {
  margin-left: auto; /* 自动推到最右边 */
  background: transparent;
  border: 1px solid var(--border-color);
  color: var(--text-muted);
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}
.toggle-btn:hover {
  background: #56ab2f;
  color: #fff;
  border-color: #56ab2f;
}

.header-line {
  width: 100%;
  height: 1px;
  background-color: var(--border-color);
  opacity: 0.5;
}

/* ========================================= */
/* 扑克牌堆叠魔法 (Stack Magic) */
/* ========================================= */
.stack-container {
  position: relative;
  width: 280px; /* 固定封面大小，保证相册列表的整齐划一 */
  height: 200px;
  margin: 20px auto 40px auto; /* 居中显示 */
  cursor: pointer;
}

/* 所有的真实照片底座 */
.stack-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* 保证不同尺寸的照片都被完美裁剪成统一规格 */
  border-radius: 10px;
  box-shadow: 0 4px 12px var(--card-shadow);
  transition: all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1); /* 极其丝滑的物理阻尼过渡 */
  border: 2px solid var(--bg-card); /* 加个边框让层次感更分明 */
}

/* 第一张图（最上面） */
.stack-0 {
  z-index: 3;
  transform: rotate(0deg);
}
/* 第二张图（微斜） */
.stack-1 {
  z-index: 2;
  transform: rotate(4deg) translate(8px, 6px);
}
/* 第三张图（反向斜） */
.stack-2 {
  z-index: 1;
  transform: rotate(-3deg) translate(-8px, 12px);
}

/* 如果超过3张，我们就用伪元素画一张“假牌背”垫在最底下！ */
.stack-container.has-fake-back::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--border-color);
  border-radius: 10px;
  z-index: 0;
  transform: rotate(6deg) translate(15px, 16px);
  box-shadow: 0 4px 12px var(--card-shadow);
  transition: all 0.4s ease;
}

/* 交互彩蛋：鼠标悬停时，像洗牌一样把牌微微散开！ */
.stack-container:hover .stack-1 {
  transform: rotate(8deg) translate(16px, 12px);
}
.stack-container:hover .stack-2 {
  transform: rotate(-6deg) translate(-16px, 20px);
}
.stack-container:hover::after {
  transform: rotate(10deg) translate(25px, 25px);
}

.photo-count {
  position: absolute;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: bold;
  z-index: 4;
  backdrop-filter: blur(4px);
}

/* ========================================= */
/* 瀑布流魔法 (Grid 状态) */
/* ========================================= */
.masonry-grid {
  column-count: 2;
  column-gap: 15px;
  animation: fadeIn 0.5s ease;
}
.masonry-item {
  break-inside: avoid;
  margin-bottom: 15px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 10px var(--card-shadow);
  cursor: zoom-in;
  transition: transform 0.3s ease;
}
.masonry-item:hover {
  transform: translateY(-3px);
}
.masonry-item img {
  width: 100%;
  display: block;
}

@media (min-width: 768px) {
  .masonry-grid {
    column-count: 3;
  }
}
@media (min-width: 1200px) {
  .masonry-grid {
    column-count: 4;
  }
}
@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
