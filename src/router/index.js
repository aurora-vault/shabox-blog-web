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

  // ===== 访客账户（SSG 不预渲染，客户端鉴权）=====
  {
    path: "/account/login",
    name: "AccountLogin",
    component: () => import("@/views/account/Login.vue"),
  },
  {
    path: "/account/register",
    name: "AccountRegister",
    component: () => import("@/views/account/Register.vue"),
  },
  {
    path: "/account/forgot",
    name: "AccountForgot",
    component: () => import("@/views/account/Forgot.vue"),
  },
  {
    path: "/account/reset",
    name: "AccountReset",
    component: () => import("@/views/account/Reset.vue"),
  },
  {
    path: "/account/profile",
    name: "AccountProfile",
    component: () => import("@/views/account/Profile.vue"),
  },
];
