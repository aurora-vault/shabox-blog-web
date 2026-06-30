<template>
  <div class="app-wrapper">
    <NavBar />

    <main class="main-content">
      <router-view />
    </main>

    <Footer />
  </div>
</template>

<script lang="ts" setup>
import NavBar from "@/components/layout/Nav.vue";
import Footer from "@/components/layout/Footer.vue";
</script>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.main-content {
  flex: 1;
  padding-top: 70px;
}
</style>
