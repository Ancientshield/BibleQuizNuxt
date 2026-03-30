/**
 * 管理者守衛：未登入 → /login，非 ADMIN → 首頁
 * 用法：在頁面 definePageMeta({ middleware: 'admin' })
 */
export default defineNuxtRouteMiddleware(() => {
  // SSG 預渲染時跳過（server 端沒有 localStorage）
  if (import.meta.server) return;

  const auth = useAuthStore();
  auth.init();

  if (!auth.isLoggedIn) {
    return navigateTo('/login');
  }
  if (!auth.isAdmin) {
    return navigateTo('/');
  }
});
