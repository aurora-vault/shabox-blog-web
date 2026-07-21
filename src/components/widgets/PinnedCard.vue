<!-- # 置顶精选小组件 -->
<template>
  <div class="pinned-card-wrapper">
    <div class="card-title">精选记忆</div>
    <div class="pinned-list">
      <div
        class="pinned-item"
        v-for="post in pinnedPosts"
        :key="'pinned-' + post.id"
        @click="router.push(`/post/${post.id}`)"
      >
        <div class="pinned-img">
          <img v-if="post.img" :src="imgUrl(post.img, IMAGE_SIZE.THUMB)" alt="cover" />
          <div v-else class="pinned-placeholder"></div>
        </div>
        <div class="pinned-info">
          <h4>{{ post.title }}</h4>
          <p>{{ post.date }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useBlogStore } from "@/store/blog.js";
import { imgUrl, IMAGE_SIZE } from "@/lib/image.js";

const router = useRouter();
const blogStore = useBlogStore();

onMounted(() => {
  blogStore.ensurePosts();
});

// 全新魔法：只挑出被你盖了 `pinned: true` 印章的帖子！
// （后面保留了 .slice(0, 3) 是一道安全锁，防止你以后不小心置顶了 10 篇，导致边栏被撑爆，它永远只展示最新的 3 篇置顶）
const pinnedPosts = computed(() => {
  return blogStore.pinnedPosts;
});
</script>

<style scoped>
/* 基础卡片外壳 */
.card-title {
  font-size: 16px;
  font-weight: bold;
  padding: 15px 20px 10px;
  border-bottom: 1px solid var(--border-color);
  text-align: center;
}
/* 精选列表专属样式 */
.pinned-list {
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
.pinned-item {
  display: flex;
  gap: 12px;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}
.pinned-item:hover {
  transform: translateX(5px);
}
.pinned-img {
  width: 45px;
  height: 45px;
  border-radius: 6px;
  overflow: hidden;
  flex-shrink: 0;
}
.pinned-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.pinned-placeholder {
  width: 100%;
  height: 100%;
  background:
    linear-gradient(135deg, rgba(86, 171, 47, 0.25), rgba(240, 255, 78, 0.18)),
    var(--article-bg);
}
.pinned-info h4 {
  font-size: 14px;
  margin: 0 0 4px 0;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-height: 1.4;
}
.pinned-info p {
  margin: 0;
  font-size: 12px;
  color: var(--text-muted);
}
</style>
