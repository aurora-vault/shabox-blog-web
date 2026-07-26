<template>
  <PageFrame>
    <h1 class="visually-hidden">代码实验室</h1>

    <div class="lab-container">
      <div class="pomodoro-card" :class="{ 'rest-mode': !isWorkMode }">
        <h2 class="mode-title">{{ isWorkMode ? "专注时间" : "休息一下" }}</h2>

        <div class="time-display">
          {{ formatTime(timeLeft) }}
        </div>

        <div class="controls">
          <button class="btn primary" @click="toggleTimer">
            {{ isRunning ? "暂停" : "开始" }}
          </button>
          <button class="btn secondary" @click="resetTimer">重置</button>
        </div>
      </div>
    </div>
  </PageFrame>
</template>

<script setup>
import { ref, onUnmounted } from "vue";
import PageFrame from "@/components/layout/PageFrame.vue";

// === 核心状态库 ===
const WORK_TIME = 25 * 60; // 25分钟 = 1500秒
const REST_TIME = 5 * 60; // 5分钟 = 300秒

const timeLeft = ref(WORK_TIME); // 当前剩余秒数
const isWorkMode = ref(true); // 是否是工作模式
const isRunning = ref(false); // 是否正在倒计时
let timerId = null; // 存放定时器的ID，用来清除倒计时

// ==========================================
// 💡 Challenge 1 (难度：⭐) : 时间格式化器
// ==========================================
// 目标：接收一个“秒数”（比如 1500），返回一个 "MM:SS" 格式的字符串（比如 "25:00"）。
// 提示：用 Math.floor() 算分钟，用 % 算剩下的秒数。如果小于 10，记得前面补个 '0'！

const formatTime = (totalSeconds) => {
  const m = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const s = (totalSeconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
};

// ==========================================
// 💡 Challenge 2 (难度：⭐⭐⭐) : 核心倒计时引擎
// ==========================================
const toggleTimer = () => {
  if (isRunning.value) {
    // 暂停逻辑
    isRunning.value = false;
    clearInterval(timerId);
  } else {
    // 开始倒计时逻辑
    isRunning.value = true;
    timerId = setInterval(() => {
      timeLeft.value--; // 时间流逝

      // 到了 0 的极限判定
      if (timeLeft.value <= 0) {
        clearInterval(timerId); // 停下秒表
        isRunning.value = false; // 状态归位

        // 翻转模式
        isWorkMode.value = !isWorkMode.value;
        // 根据新模式重置时间
        timeLeft.value = isWorkMode.value ? WORK_TIME : REST_TIME;

        // 极其简单的浏览器原生提醒
        alert(
          isWorkMode.value ? "休息结束，该干活了！" : "专注完成，去喝杯水吧！",
        );
      }
    }, 1000);
  }
};

// === 重置引擎 ===
const resetTimer = () => {
  isRunning.value = false;
  clearInterval(timerId);
  isWorkMode.value = true;
  timeLeft.value = WORK_TIME;
};

// 组件销毁时，切记清除定时器防内存泄漏
onUnmounted(() => {
  clearInterval(timerId);
});
</script>

<style scoped>
/* 实验室专属 UI (带有赛博朋克与呼吸感的极客风) */
.lab-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
}

.pomodoro-card {
  background: var(--bg-card);
  padding: 40px 60px;
  border-radius: 20px;
  box-shadow: 0 10px 30px var(--card-shadow);
  text-align: center;
  border-top: 4px solid #e6e610; /* 默认专注模式：黄色警示边框 */
  transition: all 0.5s ease;
}

/* 休息模式下的 UI 自动切换 */
.pomodoro-card.rest-mode {
  border-top-color: #56ab2f; /* 休息模式：极其舒适的绿色 */
}

.mode-title {
  color: var(--text-muted);
  font-size: 18px;
  margin-bottom: 20px;
  letter-spacing: 2px;
}

.time-display {
  font-family: "Consolas", monospace;
  font-size: 80px;
  font-weight: bold;
  color: var(--text-main);
  margin-bottom: 40px;
  text-shadow: 0 4px 10px var(--card-shadow);
}

.controls {
  display: flex;
  gap: 20px;
  justify-content: center;
}

.btn {
  padding: 10px 30px;
  font-size: 16px;
  font-weight: bold;
  border-radius: 30px;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.btn.primary {
  background: linear-gradient(145deg, #80c934, #6ca92c);
  color: white;
  box-shadow: 0 4px 15px rgba(86, 171, 47, 0.4);
}
.btn.primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(86, 171, 47, 0.6);
}

.btn.secondary {
  background: transparent;
  border: 2px solid var(--border-color);
  color: var(--text-muted);
}
.btn.secondary:hover {
  background: var(--border-color);
  color: var(--text-main);
}
</style>
