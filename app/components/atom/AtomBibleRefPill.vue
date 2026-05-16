<!--
  AtomBibleRefPill — 金黃色經文出處標籤。

  `shape` 有兩種：
  - pill：答題頁經文提示（膠囊狀、圓角 9999px、置中、不換行）
  - card：答題回顧頁錯答下方（方形、圓角 0.5rem、靠左）

  兩處視覺需求不同但顏色/圖示/語意一致，所以用一個元件加 shape 變體。

  能解析出書卷+章的 text（例如 "創世記 1:1"）會自動帶上信望愛閱讀頁連結，
  hover 時提亮並顯示外連圖示；解析失敗則退回純展示的 <p>，不會破版。
-->
<template>
  <component
    :is="href ? 'a' : 'p'"
    :href="href || undefined"
    :target="href ? '_blank' : undefined"
    :rel="href ? 'noopener noreferrer' : undefined"
    class="bible-ref"
    :class="[`bible-ref--${shape}`, { 'bible-ref--link': !!href }]"
    @click.stop
  >
    <Icon
      name="lucide:book-open"
      class="bible-ref__icon"
    />
    <span class="bible-ref__text">
      <slot>{{ text }}</slot>
    </span>
    <Icon
      v-if="href"
      name="lucide:external-link"
      class="bible-ref__external"
    />
  </component>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    text?: string;
    shape?: 'pill' | 'card';
  }>(),
  {
    shape: 'pill',
  }
);

// text 解析得出書卷+章 → 帶連結到信望愛，否則 fallback 成純 <p>
const href = computed(() => buildFhlReadUrl(props.text));
</script>

<style lang="scss" scoped>
.bible-ref {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #fbbf24;
  font-size: 1rem;
  text-decoration: none;
  transition:
    background 0.2s ease,
    border-color 0.2s ease,
    color 0.2s ease,
    transform 0.2s ease;

  &__icon,
  &__external {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;
  }

  &__external {
    width: 0.875rem;
    height: 0.875rem;
    opacity: 0.7;
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

  // ── 連結互動樣式（解析成功時才有） ──
  &--link {
    cursor: pointer;

    &:hover {
      color: #fde68a;
      background: rgba(251, 191, 36, 0.18);
      border-color: rgba(251, 191, 36, 0.55);
      transform: translateY(-1px);

      .bible-ref__external {
        opacity: 1;
      }
    }

    &:active {
      transform: translateY(0);
    }

    &:focus-visible {
      outline: 2px solid rgba(251, 191, 36, 0.7);
      outline-offset: 2px;
    }
  }
}
</style>
