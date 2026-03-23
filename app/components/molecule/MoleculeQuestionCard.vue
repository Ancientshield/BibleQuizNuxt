<template>
  <div class="question-card">
    <!-- 光暈偽邊框：漸層 purple → cyan → purple，blur 模糊 -->
    <div class="question-card__glow" />
    <h1 class="question-card__text">
      {{ content }}
    </h1>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  content: string; // 題目文字
}>();
</script>

<style lang="scss" scoped>
.question-card {
  position: relative;
  width: 100%;
  max-width: 56rem; // 與選項格 options-grid 等寬
  border-radius: 1rem;
  background: rgba(15, 23, 42, 0.4); // slate-900/40
  backdrop-filter: blur(24px); // 玻璃擬態毛玻璃效果
  border: 1px solid rgba(51, 65, 85, 0.5); // slate-700/50
  padding: 1.5rem;
  box-shadow: 0 0 40px rgba(139, 92, 246, 0.15);

  @media (min-width: 768px) {
    border-radius: 1.5rem;
    padding: 2.5rem;
  }

  &__glow { // 光暈偽邊框：purple→cyan→purple 漸層 + blur
    position: absolute;
    inset: -2px;
    border-radius: inherit;
    background: linear-gradient(to right, rgba(168, 85, 247, 0.2), rgba(34, 211, 238, 0.2), rgba(168, 85, 247, 0.2));
    filter: blur(4px);
    z-index: -1;
  }

  &__text {
    font-size: 1.25rem;
    font-weight: 700;
    text-align: center;
    color: #fff;
    line-height: 1.75;
    letter-spacing: 0.05em;

    @media (min-width: 768px) {
      font-size: 1.875rem;
    }

    @media (min-width: 1024px) {
      font-size: 2.25rem;
    }
  }
}
</style>
