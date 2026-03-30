/**
 * 登入守衛：未登入 → 導向 /login
 * 用法：在頁面 definePageMeta({ middleware: 'auth' })
 */
export default defineNuxtRouteMiddleware(() => {
  // SSG 預渲染時跳過（server 端沒有 localStorage）
  if (import.meta.server) return;

  const auth = useAuthStore();
  auth.init();

  if (!auth.isLoggedIn) {
    return navigateTo('/login');
  }
});
