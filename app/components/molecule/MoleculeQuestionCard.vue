<template>
  <div class="question-card">
    <h1 class="question-card__text">
      {{ content }}
    </h1>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  content: string;
}>();
</script>

<style lang="scss" scoped>
.question-card {
  position: relative;
  width: 100%;
  max-width: 48rem;
  border-radius: 1rem;
  background: $bg-card;
  border: 1px solid $border-base;
  padding: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);

  @media (min-width: 768px) {
    border-radius: 1.5rem;
    padding: 2.5rem;
  }

  &__text {
    position: relative;
    font-size: 1.0625rem;
    font-weight: 700;
    text-align: center;
    color: $text-heading;
    line-height: 1.6;
    font-family: 'Noto Serif TC', serif;

    @media (min-width: 390px) {
      font-size: 1.125rem;
    }

    @media (min-width: 768px) {
      font-size: 1.875rem;
      line-height: 1.75;
    }

    @media (min-width: 1024px) {
      font-size: 2.25rem;
    }
  }
}
</style>
