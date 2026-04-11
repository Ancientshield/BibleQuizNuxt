<!--
  MoleculeStatCard — 統計數字卡片（大數字 + 小標籤）。

  使用場景：首頁統計預覽、my-history 總覽。
  - size: md（首頁）/ lg（my-history，數字更大、padding 更大）
  - color: cyan / amber / purple 三色，對應不同語意（cyan 主色、amber 金幣/成就、purple 強調）
-->
<template>
  <div
    class="stat-card"
    :class="[`stat-card--${size}`]"
  >
    <div
      class="stat-card__value"
      :class="[`stat-card__value--${color}`]"
    >
      {{ value }}
    </div>
    <div class="stat-card__label">{{ label }}</div>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    value: string | number;
    label: string;
    color?: 'cyan' | 'amber' | 'purple';
    size?: 'md' | 'lg';
  }>(),
  {
    color: 'cyan',
    size: 'md',
  }
);
</script>

<style lang="scss" scoped>
.stat-card {
  border-radius: 0.75rem;
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(4px);
  border: 1px solid rgba($border-base, 0.5);
  text-align: center;

  &--md {
    padding: 1rem;
  }

  &--lg {
    padding: 1.25rem 1rem;
  }

  &__value {
    font-weight: 700;

    .stat-card--md & {
      font-size: 1.5rem;

      @media (min-width: 768px) {
        font-size: 1.875rem;
      }
    }

    .stat-card--lg & {
      font-size: 2rem;
      font-weight: 800;
    }

    &--cyan {
      color: $accent;
      filter: drop-shadow(0 0 10px rgba($accent, 0.5));
    }

    &--amber {
      color: #fbbf24;
      filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.5));
    }

    &--purple {
      color: #a855f7;
      filter: drop-shadow(0 0 10px rgba(168, 85, 247, 0.5));
    }
  }

  &__label {
    color: $text-muted;
    margin-top: 0.25rem;

    .stat-card--md & {
      font-size: 0.875rem;
    }

    .stat-card--lg & {
      font-size: 1rem;
    }
  }
}
</style>
