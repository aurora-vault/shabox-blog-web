<template>
  <Teleport to="body" :disabled="!isExpanded">
    <div
      class="lab-wrapper"
      :class="{ inline: !isExpanded, fullscreen: isExpanded }"
      @click="handleWrapperClick"
    >
      <div class="scene">
        <div class="shield" v-if="showShield"></div>

        <div
          class="bigBall"
          :style="{
            animationPlayState: isPaused ? 'paused' : 'running',
            animationDuration: revolveDuration,
          }"
        ></div>

        <div
          class="smallBall_1"
          :style="{
            animationPlayState: isPaused ? 'paused' : 'running',
            animationDuration: rotateDuration,
          }"
        >
          <div class="smallBall_2"></div>
        </div>

        <template v-if="showRain">
          <i
            v-for="rain in raindrops"
            :key="rain.id"
            :style="{
              left: rain.left,
              height: rain.height,
              animationDuration: rain.animationDuration,
              animationPlayState: isPaused ? 'paused' : 'running',
            }"
          ></i>
        </template>
      </div>

      <transition name="fade">
        <div class="controls-overlay" v-if="isExpanded" @click.stop>
          <a class="back-btn" @click="closeFullscreen">< 返回帖子</a>

          <div class="controls-panel" :class="{ 'is-open': showMenu }">
            <label class="menu-toggle" @click="showMenu = !showMenu"><</label>
            <button
              @click="showShield = !showShield"
              :class="{ off: !showShield }"
            >
              护盾
            </button>
            <button @click="showRain = !showRain" :class="{ off: !showRain }">
              雨点
            </button>
            <button @click="isPaused = !isPaused" :class="{ off: isPaused }">
              暂停
            </button>
            <button @click="speed = 8" :class="{ active: speed === 8 }">
              一档
            </button>
            <button @click="speed = 2" :class="{ active: speed === 2 }">
              二档
            </button>
            <button @click="speed = 0.5" :class="{ active: speed === 0.5 }">
              三档
            </button>
            <button @click="speed = 0.01" :class="{ active: speed === 0.01 }">
              四档
            </button>
          </div>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, onMounted, computed } from "vue";

// 核心状态：控制当前是内嵌还是全屏
const isExpanded = ref(false);

// 动效控制台状态
const showMenu = ref(true);
const showShield = ref(true);
const showRain = ref(true);
const isPaused = ref(false);
const speed = ref(8);

// 响应式计算动画时间
const revolveDuration = computed(() => `${speed.value}s`);
const rotateDuration = computed(() => `${speed.value * 1.25}s`);

// 流星数据池
const raindrops = ref([]);

onMounted(() => {
  const rand = (m, n) => Math.ceil(Math.random() * (n - m + 1)) + m - 1;
  const num = 40;
  const newRaindrops = [];
  for (let i = 0; i < num; i++) {
    newRaindrops.push({
      id: i,
      height: `${rand(10, 60)}px`,
      left: `${rand(1, 99)}%`, // 极其重要：使用 % 实现任意容器宽度的自适应
      animationDuration: `${rand(10, 30) / 10}s`,
    });
  }
  raindrops.value = newRaindrops;
});

// 内嵌模式下，点击触发全屏
const handleWrapperClick = () => {
  if (!isExpanded.value) {
    isExpanded.value = true;
    document.body.style.overflow = "hidden"; // 锁定底层网页滚动
  }
};

// 退出全屏，恢复内嵌
const closeFullscreen = () => {
  isExpanded.value = false;
  document.body.style.overflow = ""; // 解除底层网页滚动锁定
};
</script>

<style scoped>
/* =======================================================
   第一区：基础容器骨架 (不设宽高，只管背景和溢出限制)
   ======================================================= */
.lab-wrapper {
  position: relative;
  background: linear-gradient(135deg, #2c5364, #203a43, #0f2027);
  overflow: hidden;
  transition: all 0.4s ease;
  --rain-travel-distance: 150%;
}

.scene {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* =======================================================
   第二区：降级覆写 -> 内嵌态 (Inline)
   这是它在 Markdown 里的默认样子
   ======================================================= */
.lab-wrapper.inline {
  width: 100%;
  aspect-ratio: 16 / 9; /* 强制电影比例 */
  border-radius: 10px;
  cursor: zoom-in;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

/* 核心隔离：内嵌时抹杀内部一切交互，只允许最外层响应点击 */
.lab-wrapper.inline .scene {
  pointer-events: none;
}

/* =======================================================
   第三区：升级覆写 -> 全屏态 (Fullscreen)
   脱离文档流，霸占整个屏幕
   ======================================================= */
.lab-wrapper.fullscreen {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: 9999;
  border-radius: 0;
  cursor: default;
}

/* =======================================================
   第四区：具体动效 CSS (百分比自适应)
   ======================================================= */
.shield {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 45%;
  height: 0;
  padding-top: 45%;
  border-radius: 50%;
  background: linear-gradient(155deg, #a8e06321, transparent, transparent);
}
.bigBall {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 30%;
  height: 0;
  padding-top: 30%;
  border-radius: 50%;
  background: linear-gradient(155deg, #a8e063, transparent);
  box-shadow: 0px 0px 20px #60d2ff;
  animation: revolve 8s linear infinite;
}
.smallBall_1 {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 5%;
  height: 0;
  padding-top: 5%;
  border-radius: 50%;
  background: linear-gradient(45deg, #fffc00, transparent, transparent);
  animation: rotate 10s linear infinite;
}
.smallBall_1 .smallBall_2 {
  position: absolute;
  top: 20%;
  left: 20%;
  width: 60%;
  height: 0;
  padding-top: 60%;
  border-radius: 50%;
  background: linear-gradient(145deg, #ffff00, #e6e300);
  box-shadow:
    -1px 1px 5px #666500,
    1px -1px 5px #ffff00;
}

@keyframes revolve {
  from {
    transform: translate(-50%, -50%) rotate(0deg);
  }
  to {
    transform: translate(-50%, -50%) rotate(-359deg);
  }
}
@keyframes rotate {
  from {
    transform: translate(-50%, -50%) rotate(0deg) translateX(400%);
  }
  to {
    transform: translate(-50%, -50%) rotate(359deg) translateX(400%);
  }
}

.scene i {
  position: absolute;
  width: 1px;
  top: -100px;
  background-color: #fff;
  animation: line linear infinite; /* 简写属性更干净 */
}
@keyframes line {
  from {
    transform: translateY(0);
  }
  /* 强制向下位移 150 个屏幕高度单位，配合 overflow: hidden 完美消失 */
  to {
    transform: translateY(150vh);
  }
}

/* =======================================================
   第五区：控制面板UI (仅全屏时可见)
   ======================================================= */
.controls-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;
}
.back-btn {
  position: absolute;
  top: 20px;
  left: 30px;
  font-size: 16px;
  font-weight: bold;
  color: rgba(255, 255, 255, 0.6);
  cursor: pointer;
  pointer-events: auto;
  transition: color 0.3s;
}
.back-btn:hover {
  color: #fff;
}
.controls-panel {
  position: absolute;
  top: 80px;
  right: -100px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(0, 0, 0, 0.4);
  padding: 20px;
  border-radius: 10px 0 0 10px;
  transition: right 0.4s ease;
  pointer-events: auto;
}
.controls-panel.is-open {
  right: 0;
}
.menu-toggle {
  position: absolute;
  top: 50%;
  left: -30px;
  transform: translateY(-50%);
  width: 30px;
  height: 50px;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 10px 0 0 10px;
  cursor: pointer;
  color: white;
  display: flex;
  justify-content: center;
  align-items: center;
}
.controls-panel button {
  background: transparent;
  border: 1px solid #fff;
  color: #fff;
  padding: 5px 10px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}
.controls-panel button:hover {
  background: #56ab2f;
  border-color: #56ab2f;
}
.controls-panel button.off {
  opacity: 0.4;
  text-decoration: line-through;
}
.controls-panel button.active {
  background: #a8e063;
  color: #0f2027;
  border-color: #a8e063;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
