<!--
  AtomBibleRefPill — 金黃色經文出處標籤。

  `shape` 有兩種：
  - pill：答題頁經文提示（膠囊狀、圓角 9999px、置中、不換行）
  - card：答題回顧頁錯答下方（方形、圓角 0.5rem、靠左）

  兩處視覺需求不同但顏色/圖示/語意一致，所以用一個元件加 shape 變體。
-->
<template>
  <p
    class="bible-ref"
    :class="[`bible-ref--${shape}`]"
  >
    <Icon name="lucide:book-open" />
    <span>
      <slot>{{ text }}</slot>
    </span>
  </p>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    text?: string;
    shape?: 'pill' | 'card';
  }>(),
  {
    shape: 'pill',
  }
);
</script>

<style lang="scss" scoped>
.bible-ref {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #fbbf24;
  font-size: 1rem;

  svg {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }

  // ── 膠囊（答題頁經文提示） ──
  &--pill {
    justify-content: center;
    padding: 0.5rem 1.25rem;
    border-radius: 9999px;
    background: rgba(251, 191, 36, 0.1);
    border: 1px solid rgba(251, 191, 36, 0.3);
    white-space: nowrap;
  }

  // ── 卡片（答題回顧出處） ──
  &--card {
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    background: rgba(251, 191, 36, 0.08);
    border: 1px solid rgba(251, 191, 36, 0.2);
  }
}
</style>
