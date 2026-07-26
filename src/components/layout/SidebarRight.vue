<template>
  <div>
    <QuoteCard class="side-card" />
    <PinnedCard class="side-card" />
    <UserPanel class="side-card" />
  </div>
</template>

<script setup>
import QuoteCard from "@/components/widgets/QuoteCard.vue";
import PinnedCard from "@/components/widgets/PinnedCard.vue";
import UserPanel from "@/components/widgets/UserPanel.vue";
</script>

<style scoped></style>
