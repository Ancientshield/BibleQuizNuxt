<template>
  <div>
    <slot />
    <ClientOnly>
      <chat-bubble-snippet
        v-if="cfAiSearchUrl"
        :api-url="cfAiSearchUrl"
        placeholder="問我聖經相關問題..."
        hide-branding
        :translations="{ chatTitle: '聖經問答', chatEmptyTitle: '開始對話', chatEmptyDescription: '輸入訊息開始聊天' }"
        style="
          --search-snippet-primary-color: #6b4c2a;
          --search-snippet-primary-hover: #5a3d1e;
          --search-snippet-user-message-bg: #6b4c2a;
          --search-snippet-user-message-text: #ffffff;
          --search-snippet-background: #ffffff;
          --search-snippet-surface: #f3ede4;
          --search-snippet-border-color: #e2d9cc;
        "
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const cfAiSearchUrl = config.public.cfAiSearchUrl as string;
</script>
