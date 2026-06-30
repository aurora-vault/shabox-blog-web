<template>
  <div v-loading="loading">
    <el-pagination
      v-model:current-page="page"
      :page-size="24"
      :total="total"
      layout="prev, pager, next, total"
      style="margin-bottom: 16px"
      @current-change="load"
    />
    <div class="grid">
      <div v-for="asset in items" :key="asset.id" class="cell">
        <el-image
          :src="asset.url"
          fit="cover"
          style="width: 100%; height: 120px; border-radius: 4px"
          :preview-src-list="[asset.url]"
          hide-on-click-modal
        />
        <div class="meta">
          <span class="fname" :title="asset.filename">{{ asset.filename }}</span>
          <el-button link size="small" @click="copy(asset.url)">复制URL</el-button>
        </div>
      </div>
    </div>
    <el-empty v-if="!loading && items.length === 0" description="还没有图片" />
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";

import { adminFetchAssets } from "@/api/admin.js";

const items = ref([]);
const total = ref(0);
const page = ref(1);
const loading = ref(false);

async function load() {
  loading.value = true;
  try {
    const res = await adminFetchAssets({ page: page.value, pageSize: 24 });
    items.value = res.items || [];
    total.value = res.total || 0;
  } catch (err) {
    ElMessage.error(err.message);
  } finally {
    loading.value = false;
  }
}

async function copy(url) {
  try {
    await navigator.clipboard.writeText(url);
    ElMessage.success("已复制图片地址");
  } catch {
    ElMessage.warning("复制失败，请手动复制");
  }
}

onMounted(load);
</script>

<style scoped>
.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 12px;
}
.cell {
  background: #fff;
  border: 1px solid #eee;
  border-radius: 6px;
  padding: 8px;
}
.meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 6px;
}
.fname {
  font-size: 12px;
  color: #666;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 90px;
}
</style>
