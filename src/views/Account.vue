<template>
  <PageFrame mottoDark="🌙 此心安处" mottoLight="☀️ 归去来兮">
    <h1 class="visually-hidden">{{ h1 }} - 沙盒屋</h1>
    <AuthFlow :key="mode" :mode="mode" :redirect="redirect" />
  </PageFrame>
</template>

<script setup>
import { computed } from "vue";
import { useRoute } from "vue-router";
import PageFrame from "@/components/layout/PageFrame.vue";
import AuthFlow from "@/components/widgets/AuthFlow.vue";

const route = useRoute();
const mode = computed(() => route.query.mode || "login");
const redirect = computed(() => route.query.redirect || "");
const h1 = computed(() => ({ login: "登录", register: "注册", forgot: "找回密码", reset: "重置密码" }[mode.value] || "登录"));
</script>