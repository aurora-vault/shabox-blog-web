<template>
  <Teleport to="body" :disabled="!isExpanded">
    <div
      class="lab-wrapper"
      :class="{ inline: !isExpanded, fullscreen: isExpanded }"
      @click="handleWrapperClick"
    >
      <div class="scene"></div>

      <transition name="fade">
        <div class="controls-overlay" v-if="isExpanded" @click.stop>
          <a class="back-btn" @click="closeFullscreen">< 返回</a>
        </div>
      </transition>
    </div>
  </Teleport>
</template>

<script setup>
import { ref } from "vue";

const isExpanded = ref(false);

// 拦截逻辑：内嵌状态下点击触发全屏，并锁定底网页滚动
const handleWrapperClick = () => {
  if (!isExpanded.value) {
    isExpanded.value = true;
    document.body.style.overflow = "hidden";
  }
};

// 退出逻辑：解除锁定，恢复内嵌
const closeFullscreen = () => {
  isExpanded.value = false;
  document.body.style.overflow = "";
};
</script>

<style scoped>
/* =======================================================
   1. 基础容器骨架 (处理背景与溢出)
   ======================================================= */
.lab-wrapper {
  position: relative;
  background: #0f2027; /* 替换为你的默认背景 */
  overflow: hidden;
  transition: all 0.4s ease;
}

.lab-wrapper * {
  text-indent: 0 !important; /* 彻底干掉首行缩进 */
  margin: 0; /* 清除无意义的外边距 */
  padding: 0; /* 清除无意义的内边距 */
  line-height: normal; /* 恢复常规行高 */
  letter-spacing: normal; /* 恢复常规字间距 */
  box-sizing: border-box; /* 强制使用现代盒模型 */
}

.scene {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

/* =======================================================
   2. 降级覆写 -> 内嵌态 (Inline)
   ======================================================= */
.lab-wrapper.inline {
  width: 100%;
  aspect-ratio: 16 / 9;
  border-radius: 10px;
  cursor: zoom-in;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}
/* 内嵌时抹杀内部一切交互，只允许最外层响应点击 */
.lab-wrapper.inline .scene {
  pointer-events: none;
}

/* =======================================================
   3. 升级覆写 -> 全屏态 (Fullscreen)
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
   4. 你的动效具体 CSS 写在这里
   ======================================================= */

/* =======================================================
   5. UI 控制台样式 (与动效物理隔离)
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
  color: #fff;
  cursor: pointer;
  pointer-events: auto;
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
