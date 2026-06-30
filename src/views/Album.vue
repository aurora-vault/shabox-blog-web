<template>
  <div class="inner">
    <h1 class="visually-hidden">ShaBox - 像素人的相册与画廊</h1>
    <MottoHeader :showBack="true" />

    <div class="album-tabs">
      <span
        v-for="tab in albumTabs"
        :key="tab"
        class="tab-item"
        :class="{ active: currentTab === tab }"
        @click="currentTab = tab"
      >
        {{ tab }}
      </span>
    </div>

    <div class="album-container">
      <AlbumSection
        v-for="post in filteredAlbumPosts"
        :key="'album-' + post.id"
        :post="post"
        @openLightbox="handleOpenLightbox"
      />

      <div v-if="filteredAlbumPosts.length === 0" class="empty-state">
        <p>这里还没有光影落脚...</p>
      </div>
    </div>

    <Lightbox
      :show="lightboxData.show"
      :images="lightboxData.images"
      :startIndex="lightboxData.index"
      :postId="lightboxData.postId"
      @close="lightboxData.show = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import MottoHeader from "@/components/layout/MottoHeader.vue";
import AlbumSection from "@/components/widgets/AlbumSection.vue"; // 👈 引入新武器
import Lightbox from "@/components/common/Lightbox.vue"; // 👈 引入暗房
import { useBlogStore } from "@/store/blog.js";

const albumTabs = ["全部", "摄影", "游戏", "板绘", "创作"];
const currentTab = ref("全部");
const blogStore = useBlogStore();

onMounted(() => {
  blogStore.ensurePosts();
});

const filteredAlbumPosts = computed(() => {
  let validPosts = blogStore.albumPosts.filter(
    (post) => post.gallery && post.gallery.length > 0,
  );
  if (currentTab.value !== "全部") {
    validPosts = validPosts.filter((post) =>
      post.tag.includes(currentTab.value),
    );
  }
  return validPosts;
});
// 👇 掌管暗房的终极状态数据
const lightboxData = ref({
  show: false,
  images: [],
  index: 0,
  postId: null,
});

// 接收底层发来的开灯请求
const handleOpenLightbox = (data) => {
  lightboxData.value = {
    show: true,
    images: data.images, // 这里拿到的全是未经 OSS 压缩的高清原图！
    index: data.index,
    postId: data.postId,
  };
};
</script>

<style scoped>
/* ========================================= */
/* 相册大厅：自适应网格底座 */
/* ========================================= */
.album-container {
  display: grid;
  /* 魔法：每一个“相册文件夹”最小占据 300px，能塞几个塞几个 */
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px 20px;
  align-items: start; /* 让它们自然错落，互不干扰 */
}

/* Tab 和空状态的样式保留，其余的都被抽离到小组件里了，你可以删掉啦！ */
.album-tabs {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-bottom: 40px;
}
.tab-item {
  font-size: 16px;
  font-weight: bold;
  color: var(--text-muted);
  cursor: pointer;
  padding: 5px 15px;
  border-radius: 20px;
  transition: all 0.3s ease;
  user-select: none;
}
.tab-item:hover {
  color: var(--text-main);
}
.tab-item.active {
  background-color: var(--text-main);
  color: var(--bg-main);
}
.empty-state {
  text-align: center;
  color: var(--text-muted);
  padding: 100px 0;
  font-style: italic;
}
</style>
