<template>
  <header class="progress-header">
    <div class="progress-header__info">
      <span class="progress-header__question">第 {{ current }} / {{ total }} 題</span>
      <span class="progress-header__score">{{ score * 100 }} XP</span>
    </div>

    <div class="progress-bar">
      <div
        class="progress-bar__fill"
        :style="{ width: `${(score / total) * 100}%` }"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  current: number;
  total: number;
  score: number;
}>();
</script>

<style lang="scss" scoped>
.progress-header {
  margin-bottom: 0.75rem;

  @media (min-width: 768px) {
    margin-bottom: 2.5rem;
  }

  &__info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;

    @media (min-width: 768px) {
      margin-bottom: 0.75rem;
    }
  }

  &__question {
    font-size: 1rem;
    font-weight: 700;
    color: $primary;

    @media (min-width: 768px) {
      font-size: 1.25rem;
    }
  }

  &__score {
    font-size: 1rem;
    font-weight: 700;
    color: $accent;

    @media (min-width: 768px) {
      font-size: 1.25rem;
    }
  }
}

.progress-bar {
  position: relative;
  height: 0.75rem;
  border-radius: 9999px;
  background: $bg-subtle;
  border: 1px solid $border-base;
  overflow: hidden;

  @media (min-width: 768px) {
    height: 1.25rem;
  }

  &__fill {
    position: absolute;
    inset: 0;
    left: 0;
    border-radius: 9999px;
    background: linear-gradient(to right, $primary, $accent);
    transition: all 0.5s ease-out;
    overflow: hidden;

    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(to bottom, rgba(255, 255, 255, 0.25), transparent);
    }
  }
}
</style>
