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

  // ===== 访客账户 =====
  {
    path: "/account",
    name: "Account",
    component: () => import("@/views/Account.vue"),
  },
  {
    path: "/profile",
    name: "AccountProfile",
    component: () => import("@/views/Profile.vue"),
  },
];
