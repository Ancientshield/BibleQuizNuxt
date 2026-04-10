<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="['a-btn', `a-btn--${variant}`, `a-btn--${size}`, `a-btn--${appearance}`, { 'a-btn--icon-only': iconOnly }]"
    @click="handleClick"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
interface AtomButtonProps {
  variant?: 'primary' | 'positive' | 'danger' | 'warning';
  size?: 'button-s' | 'button-m' | 'button-l';
  type?: 'button' | 'submit' | 'reset';
  appearance?: 'solid-view' | 'outline-view' | 'text-view';
  disabled?: boolean;
  iconOnly?: boolean;
}

const props = withDefaults(defineProps<AtomButtonProps>(), {
  variant: 'primary',
  size: 'button-m',
  type: 'button',
  appearance: 'solid-view',
  disabled: false,
  iconOnly: false,
});

const emit = defineEmits<{
  click: [event: MouseEvent];
}>();

const handleClick = (e: MouseEvent) => {
  if (!props.disabled) emit('click', e);
};
</script>

<style lang="scss" scoped>
.a-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.375rem;
  font-weight: 600;
  border: none;
  border-radius: 0.625rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  // ── Sizes ──
  &--button-s {
    padding: 0.25rem 0.625rem;
    font-size: 1rem;
  }

  &--button-m {
    padding: 0.375rem 0.875rem;
    font-size: 1rem;
  }

  &--button-l {
    padding: 0.5rem 1.25rem;
    font-size: 1rem;
  }

  &--icon-only {
    padding: 0.375rem;
  }

  // ── Solid view ──
  &--solid-view {
    color: white;

    &.a-btn--primary {
      background: linear-gradient(to right, $gradient-start, $gradient-end);
    }

    &.a-btn--positive {
      background: $success;
    }

    &.a-btn--danger {
      background: $danger;
    }

    &.a-btn--warning {
      background: #f59e0b;
    }

    &:hover:not(:disabled) {
      opacity: 0.9;
      transform: scale(1.02);
    }

    &:active:not(:disabled) {
      transform: scale(0.98);
    }
  }

  // ── Outline view ──
  &--outline-view {
    background: transparent;

    &.a-btn--primary {
      border: 1px solid rgba($accent, 0.4);
      color: $accent;

      &:hover:not(:disabled) {
        background: rgba($accent, 0.1);
      }
    }

    &.a-btn--positive {
      border: 1px solid rgba($success, 0.4);
      color: $success;

      &:hover:not(:disabled) {
        background: rgba($success, 0.1);
      }
    }

    &.a-btn--danger {
      border: 1px solid rgba($danger, 0.4);
      color: $danger-light;

      &:hover:not(:disabled) {
        background: rgba($danger, 0.1);
      }
    }

    &.a-btn--warning {
      border: 1px solid rgba(#f59e0b, 0.4);
      color: #fbbf24;

      &:hover:not(:disabled) {
        background: rgba(#f59e0b, 0.1);
      }
    }
  }

  // ── Text view ──
  &--text-view {
    background: transparent;
    border: 1px solid transparent;

    &.a-btn--primary {
      color: $accent;
    }

    &.a-btn--danger {
      color: $danger-light;
    }

    &:hover:not(:disabled) {
      background: rgba(255, 255, 255, 0.05);
    }
  }
}
</style>
