<template>
  <nav class="nav">
    <div class="navLogo">
      <router-link to="/">
        <img src="@/assets/icons/LogoA.svg" alt="SHABOX.FUN" />
      </router-link>
    </div>

    <div
      class="btn"
      :class="{ closed: isOpen, active: isOpen }"
      @click="toggleMenu"
    >
      <div class="line"></div>
      <div class="line"></div>
      <div class="line"></div>
    </div>

    <div class="menuBar" :class="{ active: isOpen }">
      <router-link :to="{ name: 'Home' }">首页</router-link>
      <router-link :to="{ name: 'Album' }">相册</router-link>
      <router-link :to="{ path: '/about' }">关于我</router-link>
    </div>
  </nav>
</template>

<script lang="ts" setup>
// 注意：ref, watch, useRoute 均已被 unplugin-auto-import 注入全局上下文，无需手动 import
const isOpen = ref(false);
const route = useRoute();

const toggleMenu = () => {
  isOpen.value = !isOpen.value;
};

// 核心防御机制：侦听路由 VNode 树的变化
// 无论用户是点击链接，还是按浏览器的“后退”按钮，只要 URL 路径发生改变，强制剥离激活状态
watch(
  () => route.path,
  () => {
    if (isOpen.value) {
      isOpen.value = false;
    }
  },
);
</script>

<style scoped>
/* nav */
.nav {
  position: fixed;
  width: 100%;
  height: 70px;
  background: linear-gradient(to right, #a8e063, #56ab2f);
  box-shadow: 0 0 3px 1px rgb(0 0 0 / 40%);
  z-index: 10; /* 高权重 */

  display: flex; /* 设定为弹性盒子 */
  align-items: center; /* 垂直居中 */
  justify-content: space-between; /* 水平空间 */
}
.nav .navLogo {
  height: 100%;
  padding-left: 4%;
  display: flex; /* img居中 */
  align-items: center;
}
.nav .navLogo img {
  width: 140px;
}

/* PE样式 */
.nav .btn {
  margin-right: 4%;
  width: 50px;
  height: 50px;
  border-radius: 10px; /* 圆角 */
  box-shadow:
    5px 5px 0px #5c7b1e,
    -5px -5px 0px #d8ff46; /* 背景图片 */
  background: url(@/assets/icons/xsr2.svg) no-repeat center;
  background-size: cover; /* 移入变小手 */
  cursor: pointer;
  transition: all 0.4s ease-out;
  /* 线段line样式 */
  display: flex; /* 居中定位线段 */
  justify-content: center;
  align-items: center;
  flex-direction: column; /* 分行排列 */
}
.nav .btn .line {
  /* 线条的变形动画 */
  width: 40px;
  height: 5px;
  margin: 5px 0;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.4);
  transition: 0.2s ease-in;
}
.nav .btn.closed .line:nth-child(1) {
  /* 分别编写线段样式 */
  transform: translateY(15px) rotate(45deg); /* 向下平移并顺时针旋转 */
}
.nav .btn.closed .line:nth-child(2) {
  opacity: 0; /* 透明度0 */
}
.nav .btn.closed .line:nth-child(3) {
  transform: translateY(-15px) rotate(-45deg); /* 向上平移并逆时针旋转 */
  opacity: 0.6; /* 透明度0.6 */
}
.nav .btn.active {
  /* 点击事件 */
  background: linear-gradient(315deg, #a5db36, #8bb92d);
  box-shadow:
    -5px -5px 0px #5c7b1e,
    5px 5px 0px #d8ff46;
}

.nav .menuBar {
  /* 菜单栏初始状态 */
  position: absolute;
  top: 70px; /* 导航栏底部 */
  left: 0;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.94);
  transform: scaleY(0); /* 纵向缩放 */
  transform-origin: 50% 0; /* 缩放点为中心点 */
  transition: 0.2s ease-out;
}
.nav .menuBar.active {
  opacity: 1; /* 恢复透明度及缩放大小 */
  transform: scaleY(1);
}
.nav .menuBar a {
  display: block; /* 转块 */
  text-align: center; /* 文本居中 */
  line-height: 60px;
  border: 1px solid rgba(198, 217, 237, 0.302);
  transition: all 0.2s ease-out;
}
.nav .menuBar a:hover {
  box-shadow: 0 15px 20px #e0e0e0 inset; /* 内阴影 */
}
.theme-switch:hover {
  box-shadow: 0 15px 20px #e0e0e0 inset; /* 内阴影 */
}
/* PE样式 end  */

@media (min-width: 992px) {
  .nav .btn {
    /* 隐藏按钮 */
    display: none;
  }

  .nav .menuBar {
    position: static; /* 恢复正常的文档流 */
    width: 50%;
    height: 100%;
    margin-right: 4%;
    background: none;
    display: flex; /* 弹性布局 */
    align-items: center; /* 垂直居中 */
    justify-content: space-around; /* 让元素平均分配宽度 */
    transform: scaleY(1);
  }
  .nav .menuBar a {
    line-height: 55px;
    border: none;
    padding: 0 15px; /* 撑起按钮边框 */
    border-radius: 10px;
    background: linear-gradient(145deg, #80c934, #6ca92c);
    box-shadow:
      4px 4px 14px #66a02a,
      -4px -4px 14px #8ad838;
  }
  .nav .menuBar a:hover {
    border-radius: 20px;
    background: linear-gradient(145deg, #6ca92c, #80c934);
    box-shadow:
      5px 5px 14px #66a02a,
      -5px -5px 14px #8ad838;
  }
}
/* nav end   */
</style>
