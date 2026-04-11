<template>
  <div class="oauth-callback">
    <div class="oauth-callback__spinner" />
    <p class="oauth-callback__text">登入中</p>
  </div>
</template>

<script setup lang="ts">
/**
 * OAuth callback 頁面
 *
 * 邏輯完全在 middleware/oauth-callback.global.ts 處理（見該檔頂部說明）。
 * 這個 page 只留一個視覺 placeholder —— middleware 在 route navigation 的
 * guard 階段就會攔截 token、setAuth、navigateTo('/')，瀏覽器根本不會看到
 * 這個 page 真的 mount。
 *
 * 保留這個 page 的目的：Spring `OAuth2SuccessHandler` 還是 redirect 到
 * `/oauth/callback/?token=...` 這個 URL，路由總得有東西匹配到它。真的不小心
 * 落到這個 page（例如 token query 被過濾掉），使用者看到的是一個旋轉中的
 * spinner 加「登入中」，middleware 再觸發 / 人工重試也都還 OK。
 */
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
