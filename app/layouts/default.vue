<template>
  <div>
    <slot />
    <OrganismNavbar />
    <ClientOnly>
      <chat-bubble-snippet
        v-if="cfAiSearchUrl"
        :api-url="cfAiSearchUrl"
        style="--chat-bubble-button-bg: #6b4c2a; --chat-bubble-header-bg: #6b4c2a"
      />
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const cfAiSearchUrl = config.public.cfAiSearchUrl as string;
</script>
