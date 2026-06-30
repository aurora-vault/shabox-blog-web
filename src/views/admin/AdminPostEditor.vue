<template>
  <div v-loading="loading">
    <el-page-header
      :content="isEdit ? '编辑文章' : '新建文章'"
      @back="router.back()"
      style="margin-bottom: 16px"
    />

    <el-form label-position="top">
      <el-form-item label="标题">
        <el-input v-model="form.title" />
      </el-form-item>

      <el-form-item label="slug（URL 段，留空则按标题自动生成）">
        <el-input v-model="form.slug" placeholder="如 di-yi" />
      </el-form-item>

      <el-form-item label="标签">
        <el-select
          v-model="form.tags"
          multiple
          filterable
          allow-create
          default-first-option
          placeholder="选择或输入新标签"
          style="width: 100%"
        >
          <el-option
            v-for="t in allTags"
            :key="t.id"
            :label="t.name"
            :value="t.name"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="摘要 quote">
        <el-input v-model="form.quote" type="textarea" :rows="2" />
      </el-form-item>

      <el-form-item label="封面图">
        <div class="cover-row">
          <el-upload
            :show-file-list="false"
            :before-upload="onCoverUpload"
            accept="image/*"
          >
            <el-button>上传封面</el-button>
          </el-upload>
          <el-button @click="openPicker">从图库选</el-button>
          <el-image
            v-if="form.coverUrl"
            :src="form.coverUrl"
            fit="cover"
            class="cover-preview"
          />
          <el-button
            v-if="form.coverUrl"
            link
            type="danger"
            @click="form.coverUrl = ''"
            >清除</el-button
          >
        </div>
      </el-form-item>

      <el-form-item label="正文（Markdown，拖拽/粘贴图片自动上传 BOS）">
        <MdEditor
          v-model="form.contentMarkdown"
          :on-upload-async="onUploadAsync"
          class="editor"
        />
      </el-form-item>

      <el-form-item label="相册 gallery">
        <el-upload
          multiple
          :show-file-list="false"
          :before-upload="onGalleryUpload"
          accept="image/*"
        >
          <el-button>批量上传相册图</el-button>
        </el-upload>
        <div class="gallery">
          <div v-for="(url, i) in form.gallery" :key="i" class="g-item">
            <el-image :src="url" fit="cover" class="g-img" />
            <el-button
              link
              type="danger"
              size="small"
              @click="form.gallery.splice(i, 1)"
              >移除</el-button
            >
          </div>
        </div>
      </el-form-item>

      <el-form-item label="选项">
        <el-switch v-model="form.pinned" active-text="置顶" />
        <el-switch
          v-model="published"
          active-text="发布（否则存为草稿）"
          style="margin-left: 24px"
        />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" :loading="saving" @click="save"
          >保存</el-button
        >
        <el-button @click="router.back()">取消</el-button>
      </el-form-item>
    </el-form>

    <el-dialog v-model="pickerOpen" title="从图库选封面" width="720px">
      <div v-loading="pickerLoading" class="picker-grid">
        <div
          v-for="a in pickerItems"
          :key="a.id"
          class="picker-cell"
          @click="pickCover(a.url)"
        >
          <el-image :src="a.url" fit="cover" class="picker-img" />
        </div>
      </div>
      <el-empty
        v-if="!pickerLoading && pickerItems.length === 0"
        description="图库还没有图片"
      />
    </el-dialog>
  </div>
</template>

<script setup>
import { onMounted, reactive, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { MdEditor } from "md-editor-v3";
import "md-editor-v3/lib/style.css";

import {
  adminFetchPost,
  adminFetchTags,
  adminCreatePost,
  adminUpdatePost,
  adminFetchAssets,
  adminUploadImage,
} from "@/api/admin.js";

const route = useRoute();
const router = useRouter();

const isEdit = Boolean(route.params.id);
const loading = ref(false);
const saving = ref(false);
const published = ref(false);
const allTags = ref([]);

const form = reactive({
  title: "",
  slug: "",
  quote: "",
  contentMarkdown: "",
  coverUrl: "",
  gallery: [],
  pinned: false,
  tags: [],
});

// ===== 图库选封面 =====
const pickerOpen = ref(false);
const pickerLoading = ref(false);
const pickerItems = ref([]);

async function openPicker() {
  pickerOpen.value = true;
  pickerLoading.value = true;
  try {
    const res = await adminFetchAssets({ page: 1, pageSize: 60 });
    pickerItems.value = res.items || [];
  } catch (err) {
    ElMessage.error(err.message);
  } finally {
    pickerLoading.value = false;
  }
}

function pickCover(url) {
  form.coverUrl = url;
  pickerOpen.value = false;
}

// ===== 图片上传（封面 / 相册 / 正文）=====
async function onCoverUpload(file) {
  try {
    const data = await adminUploadImage(file);
    form.coverUrl = data.url;
  } catch (err) {
    ElMessage.error(err.message);
  }
  return false;
}

async function onGalleryUpload(file) {
  try {
    const data = await adminUploadImage(file);
    form.gallery.push(data.url);
  } catch (err) {
    ElMessage.error(err.message);
  }
  return false;
}

// md-editor-v3 的 onUploadAsync：拖拽/粘贴/工具栏上传都走这里
async function onUploadAsync(files) {
  return Promise.all(
    Array.from(files).map(async (file) => {
      const data = await adminUploadImage(file);
      return {
        url: data.url,
        alt: data.filename || file.name,
        title: data.filename || file.name,
      };
    }),
  );
}

async function save() {
  if (!form.title.trim()) {
    ElMessage.warning("请填写标题");
    return;
  }
  saving.value = true;
  try {
    const body = {
      title: form.title.trim(),
      slug: form.slug.trim(),
      quote: form.quote,
      contentMarkdown: form.contentMarkdown,
      coverType: form.coverUrl ? "image" : null,
      coverUrl: form.coverUrl || null,
      gallery: form.gallery,
      pinned: form.pinned,
      status: published.value ? "published" : "draft",
      tags: form.tags,
    };
    if (isEdit) {
      await adminUpdatePost(route.params.id, body);
    } else {
      await adminCreatePost(body);
    }
    ElMessage.success("已保存");
    router.push("/admin/posts");
  } catch (err) {
    ElMessage.error(err.message);
  } finally {
    saving.value = false;
  }
}

onMounted(async () => {
  try {
    allTags.value = await adminFetchTags();
  } catch {
    /* 标签加载失败不阻塞 */
  }

  if (isEdit) {
    loading.value = true;
    try {
      const post = await adminFetchPost(route.params.id);
      form.title = post.title || "";
      form.slug = post.slug || "";
      form.quote = post.quote || "";
      form.contentMarkdown = post.contentMarkdown || "";
      form.coverUrl = post.coverUrl || "";
      form.gallery = Array.isArray(post.gallery) ? post.gallery : [];
      form.pinned = Boolean(post.pinned);
      form.tags = Array.isArray(post.tags) ? post.tags : [];
      published.value = post.status === "published";
    } catch (err) {
      ElMessage.error(err.message);
    } finally {
      loading.value = false;
    }
  }
});
</script>

<style scoped>
.cover-row {
  display: flex;
  align-items: center;
  gap: 12px;
}
.cover-preview {
  width: 120px;
  height: 80px;
  border-radius: 4px;
}
.editor {
  height: 480px;
}
.gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 8px;
}
.g-item {
  text-align: center;
}
.g-img {
  width: 80px;
  height: 80px;
  border-radius: 4px;
}
.picker-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 8px;
  max-height: 480px;
  overflow: auto;
}
.picker-cell {
  cursor: pointer;
}
.picker-img {
  width: 100%;
  height: 100px;
  border-radius: 4px;
}
</style>
