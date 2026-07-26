import { defineStore } from "pinia";

import { fetchPostDetail, fetchPosts, fetchTags } from "@/api/posts.js";

export const useBlogStore = defineStore("blog", {
  state: () => ({
    posts: [],
    postDetails: {},
    tags: [],
    loadingPosts: false,
    loadingTags: false,
    loadingPostIds: {},
    error: "",
  }),
  getters: {
    pinnedPosts(state) {
      return state.posts.filter((post) => post.pinned).slice(0, 5);
    },
    albumPosts(state) {
      return state.posts.filter(
        (post) => Array.isArray(post.gallery) && post.gallery.length > 0,
      );
    },
    postCount(state) {
      return state.posts.length;
    },
    tagCount(state) {
      const tagSet = new Set();
      state.posts.forEach((post) => {
        (post.tag || []).forEach((tag) => tagSet.add(tag));
      });
      return tagSet.size;
    },
  },
  actions: {
    async ensurePosts(force = false) {
      if (this.posts.length > 0 && !force) return;
      this.loadingPosts = true;
      this.error = "";

      try {
        const data = await fetchPosts({ pageSize: 100 });
        this.posts = data.items || [];
      } catch (error) {
        this.error = error.message || "加载文章失败";
      } finally {
        this.loadingPosts = false;
      }
    },
    async ensureTags(force = false) {
      if (this.tags.length > 0 && !force) return;
      this.loadingTags = true;

      try {
        this.tags = await fetchTags();
      } catch (error) {
        this.error = error.message || "加载标签失败";
      } finally {
        this.loadingTags = false;
      }
    },
    async ensurePostDetail(slug) {
      if (this.postDetails[slug]) return this.postDetails[slug];
      this.loadingPostIds = {
        ...this.loadingPostIds,
        [slug]: true,
      };

      try {
        const post = await fetchPostDetail(slug);
        this.postDetails = {
          ...this.postDetails,
          [slug]: post,
        };
        return post;
      } catch (error) {
        this.error = error.message || "加载文章详情失败";
        throw error;
      } finally {
        this.loadingPostIds = {
          ...this.loadingPostIds,
          [slug]: false,
        };
      }
    },
  },
});
