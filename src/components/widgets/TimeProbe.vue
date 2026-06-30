<!-- # 时光探针小组件 -->
<template>
  <div class="time-probe-card">
    <div class="card-title">时光探针</div>
    <div class="probe-content">
      <div class="probe-item">
        <span>平稳运行</span>
        <strong
          >{{ runDays }}天 {{ runHours }}时 {{ runMins }}分
          {{ runSecs }}秒</strong
        >
      </div>
      <div class="probe-item">
        <span>沉淀日志</span>
        <strong>{{ postCount }} 篇</strong>
      </div>
      <div class="probe-item">
        <span>捕捉标签</span>
        <strong>{{ tagCount }} 个</strong>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useBlogStore } from "@/store/blog.js";

const blogStore = useBlogStore();

// 1. 时光引擎状态
const runDays = ref(0);
const runHours = ref(0);
const runMins = ref(0);
const runSecs = ref(0);

// 2. 自动统计文章和标签数量
const postCount = computed(() => blogStore.postCount);
const tagCount = computed(() => blogStore.tagCount);

// 3. 心跳引擎
let timer = null;
onMounted(() => {
  blogStore.ensurePosts();
  const startDate = new Date("2021-09-01T00:00:00").getTime();
  timer = setInterval(() => {
    const now = new Date().getTime();
    const diff = Math.floor((now - startDate) / 1000);
    runDays.value = Math.floor(diff / (24 * 3600));
    runHours.value = Math.floor((diff % (24 * 3600)) / 3600);
    runMins.value = Math.floor((diff % 3600) / 60);
    runSecs.value = diff % 60;
  }, 1000);
});

// 现代前端的极客素养：当组件被销毁时，记得关掉秒表，防止内存泄漏！
onUnmounted(() => {
  clearInterval(timer);
});
</script>

<style scoped>
.time-probe-card {
  /* ...原有样式不变... */

  height: 100%;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 16px;
  font-weight: bold;
  padding: 15px 20px 10px;
  border-bottom: 1px solid var(--border-color);
  text-align: center;
}

.probe-content {
  padding: 15px 20px;
  /* 👇 吸干空间，垂直居中！ */
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 12px;
}

.probe-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
}

.probe-item strong {
  color: #56ab2f;
  font-family: "Consolas", monospace; /* 极客代码字体 */
  font-size: 14px;
}
</style>
