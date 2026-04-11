<template>
  <ClientOnly>
    <div class="oauth-callback">
      <div class="oauth-callback__spinner" />
      <p class="oauth-callback__text">登入中</p>
    </div>
  </ClientOnly>
</template>

<script setup lang="ts">
/**
 * OAuth callback 頁面
 *
 * 後端 OAuth2SuccessHandler 登入成功後 redirect 到：
 * https://biblequiz.cc/oauth/callback/?token=eyJhbG...
 *
 * 這個頁面做四件事：
 * 1. 從 URL query string 取出 token
 * 2. 呼叫 /api/auth/profile 取得使用者資訊（含 avatarUrl）
 * 3. 存到 Pinia auth store（內部同步寫入 localStorage）
 * 4. 跳轉到首頁
 *
 * 強制 client-only：用 <ClientOnly> 包住 template，讓整段內容只在瀏覽器
 * 端 mount。之前試過 routeRules { prerender: false } 直接跳過 SSG 產生，
 * 但 nuxt generate 模式不會為被跳過的 route 生成 SPA shell，nginx 的
 * try_files fall through 到 / 的 index.html，瀏覽器拿到首頁 HTML 但 URL
 * 還是 /oauth/callback/?token=...，Vue router 認為當前是 / 導致 callback
 * 邏輯從未執行。<ClientOnly> 讓頁面正常 prerender 但 template 內容在
 * build 時是空的 fallback，client side 才真正 mount — 沒有 hydration
 * mismatch，onMounted 一定會跑。
 */

const { fetchProfile } = useAuthApi();
const route = useRoute();
const auth = useAuthStore();

onMounted(async () => {
  const token = route.query.token as string;

  if (!token) {
    navigateTo('/login', { replace: true });
    return;
  }

  try {
    const data = await fetchProfile(token);
    auth.setAuth(token, data);
  } catch {
    // profile 取失敗仍存 token，首頁會顯示 fallback
    auth.setAuth(token, { id: 0, email: '', name: null, role: 'USER', avatarUrl: null });
  }

  navigateTo('/', { replace: true });
});
</script>

<style lang="scss" scoped>
.oauth-callback {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100dvh;
  background: $bg-page;
  gap: 1.25rem;

  &__spinner {
    width: 3rem;
    height: 3rem;
    border: 3px solid rgba($border-base, 0.3);
    border-top-color: $accent;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
  }

  &__text {
    color: $text-muted;
    font-size: 1rem;
  }
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
