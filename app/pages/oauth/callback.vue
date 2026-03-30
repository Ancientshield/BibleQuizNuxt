<template>
  <div class="oauth-callback">
    <p>登入中...</p>
  </div>
</template>

<script setup lang="ts">
import type { UserInfo } from '~/stores/auth';

/**
 * OAuth callback 頁面
 *
 * 後端 OAuth2SuccessHandler 登入成功後 redirect 到：
 * http://localhost:3000/oauth/callback?token=eyJhbG...
 *
 * 這個頁面做四件事：
 * 1. 從 URL query string 取出 token
 * 2. 呼叫 /api/auth/profile 取得使用者資訊（含 avatarUrl）
 * 3. 存到 Pinia auth store（內部同步寫入 localStorage）
 * 4. 跳轉到首頁
 */
const route = useRoute();
const auth = useAuthStore();

onMounted(async () => {
  const token = route.query.token as string;

  if (!token) {
    navigateTo('/login', { replace: true });
    return;
  }

  try {
    const data = await $fetch<UserInfo>('/api/auth/profile', { headers: { Authorization: `Bearer ${token}` } });
    auth.setAuth(token, data);
  } catch {
    // profile 取失敗仍存 token，首頁會顯示 fallback
    auth.setAuth(token, { id: 0, email: '', name: null, role: 'USER', avatarUrl: null });
  }

  navigateTo('/', { replace: true });
});
</script>
