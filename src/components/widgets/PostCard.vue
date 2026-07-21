<template>
  <div class="card" @click="router.push(`/post/${post.id}`)">
    <img v-if="post.img" :src="imgUrl(post.img, IMAGE_SIZE.COVER)" alt="card-img" />
    <div v-else class="card-placeholder"></div>

    <div class="cardLeft">
      <h2>{{ post.title }}</h2>
      <p class="date">{{ post.date }}</p>
      <div class="tags-wrapper">
        <span
          class="tag"
          v-for="t in post.tag"
          :key="t"
          @click.stop="$emit('tagClick', t)"
          :class="{ active: selectedTags.includes(t) }"
        >
          {{ t }}
        </span>
      </div>
    </div>

    <div class="cardRight">
      <div class="cardR_copy">
        <p>
          <span>{{ post.quote }}</span>
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";
import { imgUrl, IMAGE_SIZE } from "@/lib/image.js";

defineProps({
  post: { type: Object, required: true },
  selectedTags: { type: Array, default: () => [] },
});
defineEmits(["tagClick"]);

const router = useRouter();
</script>

<style scoped>
/* 把 Home.vue 里所有跟 .card 相关的 CSS 全部搬到这里来！ */
.card {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  height: 120px;
}
/* 注意：去掉了 nth-child(1) 的金边魔法，因为在这里它只是单个卡片。金边我们等下在外部控制！ */
.card:hover img {
  filter: blur(4px);
  transform: scale(1.2);
}
.card img {
  position: absolute;
  width: 100%;
  height: 100%;
  object-fit: cover;
  top: 0;
  left: 0;
  transition: all 0.2s ease-out;
}
.card-placeholder {
  position: absolute;
  inset: 0;
  background:
    linear-gradient(135deg, rgba(86, 171, 47, 0.25), rgba(240, 255, 78, 0.18)),
    var(--article-bg);
}

.cardLeft {
  position: relative;
  width: 50%;
  height: 100%;
  padding: 20px 0 20px 4%;
  background-image: linear-gradient(
    120deg,
    var(--bg-card),
    var(--bg-card),
    transparent,
    transparent
  );
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  transition: background-image 0.4s ease;
}
.cardLeft h2 {
  font-size: 18px;
  color: var(--text-main);
  text-shadow: 0px 0px 5px var(--bg-card);
  margin-bottom: 5px;
  white-space: nowrap; /* 第一道锁：所有文字绝对不许换行！ */
  overflow: hidden; /* 第二道锁：超出卡片边界的文字，直接斩断隐藏！ */
  text-overflow: ellipsis; /* 第三道锁：在斩断的切口处，优雅地补上“...” */
  transition:
    color 0.4s ease,
    text-shadow 0.4s ease;
}
.cardLeft .date {
  line-height: 20px;
  color: var(--text-muted); /* 替换原来的灰色 */
  transition: color 0.4s ease;
  font-size: 13px;
  margin-bottom: 5px;
}

.tags-wrapper {
  display: flex;
  flex-wrap: nowrap;
  gap: 5px;
  overflow: hidden;
  width: 100%;
}
.cardLeft .tag {
  display: inline-block;
  padding: 2px 6px;
  font-size: 10px;
  color: var(--text-main);
  border: 1px solid var(--border-color); /* 替换边框色 */
  transition: all 0.4s ease; /* 保持这句，悬停色不变 */
  border-radius: 4px;
  flex-shrink: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  cursor: pointer;
  transition: all 0.3s;
}
.cardLeft .tag:hover {
  background-color: #d8ff46;
  color: #5c7b1e;
  border-color: #d8ff46;
}
.cardLeft .tag.active {
  background: linear-gradient(145deg, #80c934, #6ca92c);
  color: #fff;
  border-color: transparent;
}

.cardRight {
  position: absolute;
  right: 0;
  top: 0;
  width: 46%;
  height: 100%;
  z-index: 2;
}
.cardR_copy {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: flex-end;
  background-image: linear-gradient(
    -60deg,
    rgb(0, 0, 0),
    rgba(0, 0, 0, 0.5),
    transparent,
    transparent
  );
  padding-right: 4%;
}
.cardR_copy p span {
  color: #f5f5f7;
  text-align: right;
  text-shadow: 0px 1px 1px #1d1d1f;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  transition: all 0.3s;
  /* 👇 核心魔法：允许卡片上的副标题也物理换行 */
  white-space: pre-line;
}
.card:hover .cardR_copy p span {
  -webkit-line-clamp: 4;
}
</style>
