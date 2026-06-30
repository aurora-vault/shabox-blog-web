<template>
  <div class="inner">
    <h1 class="visually-hidden">ShaBox - 像素人的个人博客与代码沙盒</h1>

    <MottoHeader />
    <!-- 首页用这个 -->

    <div class="home-layout">
      <SidebarLeft
        class="sidebar-left"
        :selectedTags="selectedTags"
        :isMatchAll="isMatchAll"
        @toggle="toggleTag"
        @updateMatchAll="isMatchAll = $event"
      />

      <div class="main-content">
        <div class="post-grid">
          <PostCard
            v-for="post in filteredPosts"
            :key="post.id"
            :post="post"
            :selectedTags="selectedTags"
            @tagClick="toggleTag"
          />
        </div>
      </div>

      <SidebarRight class="sidebar-right" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import MottoHeader from "@/components/layout/MottoHeader.vue";
import PostCard from "@/components/widgets/PostCard.vue";
import { useHead } from "@unhead/vue";
import { useBlogStore } from "@/store/blog.js";
// 动态注入该页面的 SEO 信息
useHead({
  title: "沙盒屋",
  meta: [
    {
      name: "description",
      content:
        "欢迎来到 Shabox 的个人网站，这里分享前端技术、个人随笔与生活记录。",
    },
  ],
});

// 引入左右护法
import SidebarLeft from "@/components/layout/SidebarLeft.vue";
import SidebarRight from "@/components/layout/SidebarRight.vue";

const blogStore = useBlogStore();

// =========================================
// Home.vue 的核心大脑：掌控数据与联动
// =========================================
const selectedTags = ref([]); // 记事本：记下选中的标签
// 👇 新增魔法：控制交集(AND)还是并集(OR)的开关，默认 false (并集)
const isMatchAll = ref(false);

onMounted(async () => {
  await blogStore.ensurePosts();
  await blogStore.ensureTags();
});

const postList = computed(() => blogStore.posts);

// 接收左护法传来的信号，修改记事本
const toggleTag = (tag) => {
  const index = selectedTags.value.indexOf(tag);
  if (index > -1) {
    selectedTags.value.splice(index, 1);
  } else {
    selectedTags.value.push(tag);
  }
};

// Home.vue 过滤算法优化
const filteredPosts = computed(() => {
  const selectedLen = selectedTags.value.length;
  if (selectedLen === 0) return postList.value;

  // 在闭包外层将选中标签转化为 Set，避免在 filter 循环中重复创建
  const selectedSet = new Set(selectedTags.value);

  return postList.value.filter((post) => {
    let matchCount = 0;
    for (let i = 0; i < post.tag.length; i++) {
      if (selectedSet.has(post.tag[i])) {
        matchCount++;
        // OR 模式：只要匹配到一个，立即短路返回 (Short-circuit evaluation)
        if (!isMatchAll.value) return true;
      }
    }
    // AND 模式：匹配数量必须等于选中的标签数量
    return isMatchAll.value ? matchCount === selectedLen : false;
  });
});
</script>

<style scoped>
/* ========================================= */
/* 移动端优先：全局基础骨架 */
/* ========================================= */

/* 手机端默认堆叠 */
.home-layout {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ========================================= */
/* 侧边栏通用样式 (左右两边的卡片外观) */
/* ========================================= */
.sidebar-left,
.sidebar-right {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* ========================================= */
/* 中间主舞台：沉浸式卡片瀑布流 */
/* ========================================= */
.post-grid {
  width: 100%;
  display: grid;
  /*
    核心魔法：min(100%, 340px)
    物理逻辑：在 PC 或大屏上，100% 大于 340px，它取 340px，维持你原有的瀑布流完美比例。
    在极限小屏手机上（如剩余空间只有 300px），它取 100%，允许卡片被压缩到 300px，绝对不撑爆屏幕！
  */
  grid-template-columns: repeat(auto-fill, minmax(min(100%, 340px), 1fr));
  gap: 16px;
}
/* 让前两张卡片拥有尊贵金边（利用 Vue 组件在根元素上的穿透特性） */
.post-grid > :nth-child(1),
.post-grid > :nth-child(2) {
  box-shadow:
    1px 1px 2px gold,
    -1px -1px 2px gold;
}

/* 手机端默认：左右护法直接隐身，把 100% 的空间让给卡片瀑布流！ */
.sidebar-left,
.sidebar-right {
  display: none;
}

/* ========================================= */
/* PC 端响应式：完美对称的三栏布局 + 双吸顶魔法 */
/* ========================================= */
@media (min-width: 992px) {
  .home-layout {
    display: grid;
    grid-template-columns: 23% 50% 23%;
    justify-content: space-between;
    align-items: flex-start;
  }

  .sidebar-left,
  .sidebar-right {
    display: flex;
    flex-direction: column;
    gap: 20px;

    /* 1. 开启吸顶 */
    position: sticky;
    top: 110px;

    /* 2. 极其核心：给水桶加盖子！最大高度等于屏幕高度减去顶部距离 */
    max-height: calc(100vh - 110px);

    /* 3. 现在，由于高度被限制了，内部滚动条终于能生效了！ */
    overflow-y: auto;
  }
  /* 👇 就是这句终极修复魔法！ */
  /* 告诉左右护法里的每一个卡片：打死也不许收缩！ */
  .sidebar-left > *,
  .sidebar-right > * {
    flex-shrink: 0;
  }

  /* 终极隐身术：彻底抹杀护法自带的滚动条，保留滚动功能 */

  /* 1. 兼容 Firefox (火狐标准) */
  .sidebar-left,
  .sidebar-right {
    scrollbar-width: none;
    -ms-overflow-style: none; /* 顺手兼容一下 IE 和老 Edge */
  }

  /* 2. 兼容 Chrome, Safari, 新版 Edge (Webkit 核心) */
  .sidebar-left::-webkit-scrollbar,
  .sidebar-right::-webkit-scrollbar {
    display: none;
    width: 0;
    height: 0;
  }

  .main-content {
    width: 100%;
  }
}
</style>
