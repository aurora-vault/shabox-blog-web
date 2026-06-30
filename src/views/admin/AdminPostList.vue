<template>
  <div>
    <div class="bar">
      <el-input
        v-model="keyword"
        placeholder="搜索标题/摘要"
        clearable
        style="width: 240px"
        @keyup.enter="load"
        @clear="load"
      />
      <el-select
        v-model="status"
        placeholder="状态"
        clearable
        style="width: 120px"
        @change="load"
      >
        <el-option label="已发布" value="published" />
        <el-option label="草稿" value="draft" />
      </el-select>
      <el-button @click="load">查询</el-button>
      <el-button type="primary" @click="router.push('/admin/posts/new')">
        新建文章
      </el-button>
    </div>

    <el-table v-loading="loading" :data="posts" border>
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column label="状态" width="90">
        <template #default="{ row }">
          <el-tag
            :type="row.status === 'published' ? 'success' : 'info'"
            size="small"
            >{{ row.status === "published" ? "已发布" : "草稿" }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column label="置顶" width="70" align="center">
        <template #default="{ row }">{{ row.pinned ? "📌" : "" }}</template>
      </el-table-column>
      <el-table-column prop="date" label="发布时间" width="120" />
      <el-table-column label="操作" width="240" fixed="right">
        <template #default="{ row }">
          <el-button link @click="router.push(`/admin/posts/${row.id}`)"
            >编辑</el-button
          >
          <el-button
            v-if="row.status === 'draft'"
            link
            type="success"
            @click="publish(row)"
            >发布</el-button
          >
          <el-button v-else link type="warning" @click="unpublish(row)"
            >撤回</el-button
          >
          <el-popconfirm title="删除该文章？" @confirm="remove(row)">
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
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";

import {
  adminFetchPosts,
  adminDeletePost,
  adminPublishPost,
  adminUnpublishPost,
} from "@/api/admin.js";

const router = useRouter();
const posts = ref([]);
const loading = ref(false);
const keyword = ref("");
const status = ref("");

async function load() {
  loading.value = true;
  try {
    posts.value = await adminFetchPosts({
      keyword: keyword.value,
      status: status.value,
    });
  } catch (err) {
    ElMessage.error(err.message);
  } finally {
    loading.value = false;
  }
}

async function publish(row) {
  await adminPublishPost(row.id);
  ElMessage.success("已发布");
  load();
}

async function unpublish(row) {
  await adminUnpublishPost(row.id);
  ElMessage.success("已撤回");
  load();
}

async function remove(row) {
  await adminDeletePost(row.id);
  ElMessage.success("已删除");
  load();
}

onMounted(load);
</script>

<style scoped>
.bar {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}
</style>
