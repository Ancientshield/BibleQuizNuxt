/**
 * admin middleware — 管理者守衛（路由層）
 *
 * 用途：擋下非 ADMIN 使用者進入管理後台頁面。
 * 使用方式：頁面裡 `definePageMeta({ middleware: ['auth', 'admin'] })`。
 * 通常和 auth middleware 一起用（先確認登入，再確認角色）。
 *
 * 檢查順序：
 * 1. 未登入 → /login
 * 2. 已登入但非 ADMIN → 首頁（不是 /login，因為他「有」登入只是沒權限）
 * 3. 登入 + ADMIN → 放行
 *
 * 為什麼這裡也呼叫 auth.init() 而不是只在 auth middleware 叫：
 * Nuxt 的 middleware 順序是依 definePageMeta 的陣列順序跑，但有些頁面可能
 * 只掛 admin 而沒掛 auth（雖然目前沒這種情況）。讓每個 middleware 自己負責
 * init，比較安全。重複呼叫 init() 會被內部 flag 擋掉，成本是一個 if 判斷。
 *
 * 更詳細的 middleware 架構說明見 middleware/auth.ts 的檔頭註解。
 */
export default defineNuxtRouteMiddleware(() => {
  // SSG 預渲染時 server 端沒有 localStorage，直接跳過
  if (import.meta.server) return;

  const auth = useAuthStore();
  auth.init(); // 重複呼叫安全

  if (!auth.isLoggedIn) {
    return navigateTo('/login');
  }
  if (!auth.isAdmin) {
    return navigateTo('/');
  }
});
