/**
 * Client-only plugin：app 啟動時從 localStorage 載入登入狀態到 Pinia store。
 * 檔名 .client.ts 確保只在瀏覽器端執行，SSG 預渲染時不會跑。
 */
export default defineNuxtPlugin(() => {
  const auth = useAuthStore();
  auth.init();
});
