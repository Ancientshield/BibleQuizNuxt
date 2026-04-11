/**
 * oauth-callback.global.ts — OAuth 登入 callback 的 global middleware
 *
 * 為什麼是 middleware 不是 component onMounted？
 * ─────────────────────────────────────────
 * 原本實作放在 pages/oauth/callback.vue 的 onMounted，但在 Nuxt SSG
 * 下碰到一個 hydration edge case：從外部（Spring redirect）第一次載入
 * /oauth/callback/?token=... 時，Vue 看到 prerender DOM 認為 component
 * 已經掛好了，skip 掉 onMounted 觸發 → setup 的 side effect 從未執行，
 * 頁面永遠卡在「登入中」。
 *
 * 實測：SPA 內部 router.push('/oauth/callback/...') 100% 正常跑完 setAuth +
 * 跳轉；只有 full page load + hydration 這條路才壞。
 *
 * 解法：把 token 處理搬到 global middleware。middleware 在 navigation guard
 * 階段跑，早於 component setup 跟 hydration，不依賴任何 page lifecycle，
 * 一定會觸發。每個 navigation 都掃一次 route.query.token，有就處理。
 *
 * 觸發條件：route.query 有 token（通常是 Spring 剛 redirect 過來）且當前
 * 尚未登入。處理完就 replace 路徑去 / 把 query 洗掉。
 */
export default defineNuxtRouteMiddleware(async to => {
  // SSG 預渲染 server 端沒有 API client 可用，等到 client 再處理
  if (import.meta.server) return;

  const token = to.query.token;
  if (!token || typeof token !== 'string') return;

  const auth = useAuthStore();
  if (auth.isLoggedIn) return; // 已登入就不重複處理

  const { fetchProfile } = useAuthApi();
  try {
    const data = await fetchProfile(token);
    auth.setAuth(token, data);
  } catch {
    // profile API 失敗還是先把 token 存起來，首頁會顯示 fallback 頭像
    auth.setAuth(token, { id: 0, email: '', name: null, role: 'USER', avatarUrl: null });
  }

  // 洗掉 query 裡的 token，避免留在 URL / history / 分享連結
  return navigateTo('/', { replace: true });
});
