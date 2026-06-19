<template>
  <button
    class="quiz-item"
    :class="[`quiz-item--${color}`, { 'quiz-item--used': used, 'quiz-item--burst': burst }]"
    :disabled="used || disabled"
    @click="$emit('use')"
  >
    <Icon :name="icon" />
    <span class="quiz-item__label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  label: string;
  color: 'red' | 'amber' | 'cyan';
  used?: boolean;
  burst?: boolean;
  disabled?: boolean;
}>();

defineEmits<{
  use: [];
}>();
</script>

<style lang="scss" scoped>
.quiz-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.5625rem 0.75rem;
  border-radius: 0.75rem;
  background: $bg-card;
  border: 1.5px solid;
  cursor: pointer;
  transition: all 0.25s ease;
  overflow: hidden;

  svg {
    width: 1.25rem;
    height: 1.25rem;
    transition: all 0.25s;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

    svg {
      transform: scale(1.15);
    }
  }

  &:active:not(:disabled) {
    transform: scale(0.92);
  }

  &__label {
    font-size: 0.875rem;
    font-weight: 600;
  }

  @media (min-width: 390px) {
    padding: 0.625rem 1rem;

    svg {
      width: 1.375rem;
      height: 1.375rem;
    }

    &__label {
      font-size: 0.9375rem;
    }
  }

  @media (min-width: 768px) {
    padding: 0.75rem 1.25rem;
    border-radius: 1rem;

    svg {
      width: 1.5rem;
      height: 1.5rem;
    }

    &__label {
      font-size: 1rem;
    }
  }

  &--red {
    border-color: rgba($danger, 0.3);
    color: $danger;

    &:hover:not(:disabled) {
      border-color: rgba($danger, 0.5);
      background: rgba($danger, 0.04);
    }
  }

  &--amber {
    border-color: rgba($accent, 0.3);
    color: $accent;

    &:hover:not(:disabled) {
      border-color: rgba($accent, 0.5);
      background: rgba($accent, 0.04);
    }
  }

  &--cyan {
    border-color: rgba($secondary, 0.3);
    color: $secondary;

    &:hover:not(:disabled) {
      border-color: rgba($secondary, 0.5);
      background: rgba($secondary, 0.04);
    }
  }

  &--burst {
    animation: item-burst 0.6s ease-out;
  }

  &--used {
    border-color: rgba($border-base, 0.4) !important;
    color: $text-dim !important;
    background: $bg-subtle;
    box-shadow: none !important;

    .quiz-item__label {
      text-decoration: line-through;
    }
  }

  &:disabled {
    cursor: not-allowed;
  }
}

@keyframes item-burst {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  30% {
    transform: scale(1.15);
    filter: brightness(1.3);
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
}
</style>
