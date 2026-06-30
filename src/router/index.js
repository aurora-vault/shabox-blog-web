// src/router/index.js
import Home from "@/views/Home.vue";

export const routes = [
  {
    path: "/",
    name: "Home",
    component: Home, // 首屏同步加载
  },
  {
    path: "/about",
    name: "About",
    component: () => import("@/views/About.vue"), // 次屏懒加载分包
  },
  {
    path: "/post/:id",
    name: "PostDetail",
    component: () => import("@/views/PostDetail.vue"),
  },
  {
    path: "/album",
    name: "Album",
    component: () => import("@/views/Album.vue"),
  },
  {
    path: "/lab/pomodoro",
    name: "Pomodoro",
    component: () => import("@/views/lab/Pomodoro.vue"),
  },

  // ===== admin 写作后台（SSG 不预渲染，客户端鉴权）=====
  {
    path: "/admin/login",
    name: "AdminLogin",
    component: () => import("@/views/admin/AdminLogin.vue"),
  },
  {
    path: "/admin",
    component: () => import("@/views/admin/AdminLayout.vue"),
    children: [
      { path: "", redirect: "/admin/posts" },
      {
        path: "posts",
        name: "AdminPosts",
        component: () => import("@/views/admin/AdminPostList.vue"),
      },
      {
        path: "posts/new",
        name: "AdminPostNew",
        component: () => import("@/views/admin/AdminPostEditor.vue"),
      },
      {
        path: "posts/:id",
        name: "AdminPostEdit",
        component: () => import("@/views/admin/AdminPostEditor.vue"),
      },
      {
        path: "tags",
        name: "AdminTags",
        component: () => import("@/views/admin/AdminTagList.vue"),
      },
      {
        path: "assets",
        name: "AdminAssets",
        component: () => import("@/views/admin/AdminAssetLibrary.vue"),
      },
    ],
  },
];
