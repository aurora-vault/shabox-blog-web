<!-- # 标签云小组件 -->
<template>
  <div class="tag-card-wrapper">
    <div class="card-title">
      <span>探索沙盒</span>
      <span
        class="logic-switch"
        title="切换筛选模式"
        @click="$emit('updateMatchAll', !isMatchAll)"
      >
        {{ isMatchAll ? "交集 (AND)" : "并集 (OR)" }}
      </span>
    </div>

    <div class="tag-cloud">
      <span
        v-for="tag in sortedTags"
        :key="tag"
        class="tag-item"
        :class="{ active: selectedTags.includes(tag) }"
        @click="$emit('toggle', tag)"
      >
        {{ tag }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from "vue";
import { useBlogStore } from "@/store/blog.js";

// 1. 接收父组件（Home.vue）传来的“当前选中了哪些标签”的本子
defineProps({
  selectedTags: {
    type: Array,
    default: () => [],
  },
  isMatchAll: Boolean, // 👈 接收开关状态
});

// 2. 定义向外发射的信号：当标签被点击时，大喊一声 "toggle"
defineEmits(["toggle", "updateMatchAll"]); // 👈 新增抛出事件
const blogStore = useBlogStore();

onMounted(() => {
  blogStore.ensurePosts();
  blogStore.ensureTags();
});

// =========================================
// 3. 你专属的“置顶标签特权名单”
// 写在前面的，永远排在标签云的最前面！
// =========================================
// TagCloud.vue 脚本重构
const pinnedTags = ["公告", "随笔", "日志"];
// 建立权重字典：{ '公告': 0, '随笔': 1, '日志': 2 }
const pinnedWeight = Object.create(null);
pinnedTags.forEach((tag, index) => {
  pinnedWeight[tag] = index;
});

// 4. 提取全站标签，并进行“阶级排序”
const sortedTags = computed(() => {
  const allTags = new Set(
    blogStore.tags.length > 0
      ? blogStore.tags.map((tag) => tag.name)
      : blogStore.posts.flatMap((post) => post.tag || []),
  );

  return Array.from(allTags).sort((a, b) => {
    // 使用 in 操作符或直接读取，时间复杂度 O(1)
    const hasA = a in pinnedWeight;
    const hasB = b in pinnedWeight;

    if (hasA && hasB) return pinnedWeight[a] - pinnedWeight[b];
    if (hasA) return -1;
    if (hasB) return 1;
    return a.localeCompare(b, "zh-CN"); // 注入 'zh-CN' 保证中文字符按拼音物理顺序排序
  });
});
</script>

<style scoped>
.tag-card-wrapper {
  border-radius: 10px;
  overflow: hidden;
  /* 新增魔法：允许拉伸并垂直排列 */
}
/* 修改标题为弹性布局，把开关放在右边 */
.card-title {
  font-size: 16px;
  font-weight: bold;
  padding: 15px 20px 10px;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-main);
  display: flex;
  justify-content: space-between; /* 左右分列 */
  align-items: center;
  transition:
    color 0.4s ease,
    border-color 0.4s ease;
}

/* 切换按钮的极客样式 */
.logic-switch {
  font-size: 11px;
  font-weight: normal;
  color: var(--text-main);
  background-color: var(--border-color);
  padding: 2px 6px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  user-select: none;
}
.logic-switch:hover {
  background-color: #d8ff46;
  color: #5c7b1e;
}

.tag-cloud {
  /* 新增魔法：撑满剩下的所有空间 */
  padding: 15px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: center;
}
.tag-item {
  padding: 4px 12px;
  font-size: 12px;
  color: var(--text-main);
  background-color: var(--article-bg);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  user-select: none;
}
.tag-item:hover {
  background-color: #d8ff46;
  color: #5c7b1e;
}
.tag-item.active {
  background: linear-gradient(145deg, #80c934, #6ca92c);
  color: var(--text-main);
  box-shadow:
    2px 2px 6px #66a02a,
    -2px -2px 6px #8ad838;
}
</style>
