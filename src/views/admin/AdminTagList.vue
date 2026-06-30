<template>
  <div>
    <div class="bar">
      <el-input
        v-model="newName"
        placeholder="新标签名"
        style="width: 200px"
        @keyup.enter="create"
      />
      <el-button type="primary" @click="create">新建</el-button>
      <span class="hint">提示：中文标签会被自动保留原名作为 slug</span>
    </div>

    <el-table v-loading="loading" :data="tags" border>
      <el-table-column prop="name" label="名称" min-width="160" />
      <el-table-column prop="slug" label="slug" min-width="160" />
      <el-table-column prop="postCount" label="文章数" width="90" align="center" />
      <el-table-column label="操作" width="120">
        <template #default="{ row }">
          <el-popconfirm title="删除该标签？" @confirm="remove(row)">
            <template #reference>
              <el-button link type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
import { onMounted, ref } from "vue";
import { ElMessage } from "element-plus";

import { adminFetchTags, adminCreateTag, adminDeleteTag } from "@/api/admin.js";

const tags = ref([]);
const loading = ref(false);
const newName = ref("");

async function load() {
  loading.value = true;
  try {
    tags.value = await adminFetchTags();
  } catch (err) {
    ElMessage.error(err.message);
  } finally {
    loading.value = false;
  }
}

async function create() {
  if (!newName.value.trim()) return;
  try {
    await adminCreateTag({ name: newName.value.trim() });
    newName.value = "";
    load();
  } catch (err) {
    ElMessage.error(err.message);
  }
}

async function remove(row) {
  try {
    await adminDeleteTag(row.id);
    load();
  } catch (err) {
    ElMessage.error(err.message);
  }
}

onMounted(load);
</script>

<style scoped>
.bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  align-items: center;
}
.hint {
  font-size: 12px;
  color: #999;
}
</style>
