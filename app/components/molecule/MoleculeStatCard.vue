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
  background: $bg-card;
  border: 1px solid $border-base;
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
      color: $primary;
    }

    &--amber {
      color: $accent;
    }

    &--purple {
      color: $secondary;
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
