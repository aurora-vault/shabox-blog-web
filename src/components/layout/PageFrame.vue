<template>
  <div class="inner">
    <MottoHeader
      :showBack="showBack"
      :darkText="mottoDark"
      :lightText="mottoLight"
    />
    <slot />
  </div>
</template>

<script setup>
import MottoHeader from "@/components/layout/MottoHeader.vue";

defineProps({
  showBack: { type: Boolean, default: true }, // 返回键(首页 false)
  mottoDark: String, // 不传 = 默认「🌙 月光如梦」
  mottoLight: String, // 不传 = 默认「☀️ 晨光微熹」
});
</script>
