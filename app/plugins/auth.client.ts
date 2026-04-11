/**
 * auth.client.ts — app 啟動時從 localStorage 還原登入狀態
 *
 * 檔名 `.client.ts` 是 Nuxt 約定，代表這個 plugin 只在瀏覽器端執行
 * （SSG 預渲染時不會跑）。這很重要，因為 plugin 裡讀 localStorage，
 * 在 Node.js 環境會拋 ReferenceError。
 *
 * 執行時機：Nuxt app 啟動、vue 初始化之後、第一個頁面渲染之前。
 *
 * ──────────────────────────────────────────
 * 為什麼需要這個 plugin？
 * ──────────────────────────────────────────
 * auth store 裡的 token 和 user 預設是 null（見 stores/auth.ts 的 init 函式說明），
 * 必須有人主動把 localStorage 的值讀進 store，app 才會記得「使用者昨天已經登入過」。
 * 這個 plugin 就是在 app 啟動時做這件事的入口。
 *
 * ──────────────────────────────────────────
 * Plugin vs Middleware 的分工
 * ──────────────────────────────────────────
 * - Plugin：一次性初始化，把 localStorage 讀進 store（這個檔案的工作）
 * - Middleware：每次導航時檢查權限，決定要不要放行
 *
 * Middleware 裡也會呼叫 auth.init() 是為了防禦性保險，避免依賴 plugin 的執行順序。
 * store 內部有 initialized flag 擋重複執行，多叫沒關係。
 */
export default defineNuxtPlugin(() => {
  const auth = useAuthStore();
  auth.init();
});
