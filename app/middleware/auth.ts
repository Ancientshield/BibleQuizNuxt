/**
 * auth middleware — 登入守衛（路由層）
 *
 * 用途：擋下未登入使用者進入需要登入的頁面，自動導向 /login。
 * 使用方式：頁面裡 `definePageMeta({ middleware: 'auth' })` 就會套用。
 *
 * ──────────────────────────────────────────
 * 為什麼用 middleware 而不是頁面 onMounted？
 * ──────────────────────────────────────────
 * onMounted 是「先渲染頁面，再判斷要不要跳走」→ 會閃一下內容才跳，體驗差。
 * middleware 是「導航還沒完成就擋下來」→ 使用者看不到中間狀態，直接跳走。
 * 而且 NuxtLink 預載、手動輸入網址、程式呼叫 navigateTo 都會自動跑 middleware，
 * 只要一個地方設好，所有進入途徑都會擋。
 *
 * ──────────────────────────────────────────
 * 為什麼要呼叫 auth.init()？
 * ──────────────────────────────────────────
 * 登入狀態存在瀏覽器的 localStorage 裡，但 Pinia store 剛建立時 ref 初始值是 null。
 * 必須有人主動把 localStorage 讀進 store。平常這件事由 plugins/auth.client.ts
 * 在 app 啟動時做一次，但 middleware 為了「不依賴 plugin 執行順序」會再叫一次，
 * init() 內部有 initialized flag 擋重複執行，多叫一次不會重讀。
 *
 * ──────────────────────────────────────────
 * 為什麼 server-side 要 return？
 * ──────────────────────────────────────────
 * 專案是 SSG（nuxt generate），預渲染在 Node.js 跑，沒有 localStorage。
 * 直接讀會拋 ReferenceError，所以 server-side 整段跳過，等到瀏覽器端再跑。
 */
export default defineNuxtRouteMiddleware(() => {
  // SSG 預渲染時 server 端沒有 localStorage，直接跳過
  if (import.meta.server) return;

  const auth = useAuthStore();
  auth.init(); // 確保 store 已從 localStorage 讀取狀態（重複呼叫安全）

  if (!auth.isLoggedIn) {
    return navigateTo('/login');
  }
});
