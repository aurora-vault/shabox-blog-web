<template>
  <div class="auth-stage">
    <div class="auth-panel side-card">
      <h2 class="auth-heading">{{ title }}</h2>
      <slot />
    </div>
  </div>
</template>

<script setup>
defineProps({ title: { type: String, required: true } });
</script>

<style scoped>
/* 只账户四页用,scoped 在 widget,不进全局 index.css;配合全局 .side-card */
.auth-stage {
  display: flex;
  justify-content: center;
  padding: 40px 0;
}
.auth-panel {
  width: 360px;
  padding: 24px;
}
.auth-heading {
  text-align: center;
  margin: 0 0 16px;
}
</style>
