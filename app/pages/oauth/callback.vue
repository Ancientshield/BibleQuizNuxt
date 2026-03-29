<template>
  <div class="oauth-callback">
    <p>登入中...</p>
  </div>
</template>

<script setup lang="ts">
/**
 * OAuth callback 頁面
 *
 * 後端 OAuth2SuccessHandler 登入成功後 redirect 到：
 * http://localhost:3000/oauth/callback?token=eyJhbG...
 *
 * 這個頁面做三件事：
 * 1. 從 URL query string 取出 token
 * 2. 存到 localStorage
 * 3. 跳轉到首頁
 */
const route = useRoute();

onMounted(() => {
  const token = route.query.token as string;

  if (token) {
    localStorage.setItem('jwt', token);
    navigateTo('/', { replace: true });
  } else {
    // 沒有 token，可能是直接打這個頁面，導回登入頁
    navigateTo('/login', { replace: true });
  }
});
</script>
