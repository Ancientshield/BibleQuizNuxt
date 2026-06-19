<template>
  <span
    :class="stateClass"
    class="badge"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
type BadgeState = 'default' | 'correct' | 'wrong' | 'disabled';

const props = defineProps<{
  label: string;
  state: BadgeState;
}>();

const stateClass = computed(() => `badge--${props.state}`);
</script>

<style lang="scss" scoped>
.badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  flex: 0 0 1.75rem;
  border-radius: 0.5rem;
  font-weight: 700;
  font-size: 0.9375rem;

  @media (min-width: 390px) {
    width: 2rem;
    height: 2rem;
    flex-basis: 2rem;
    font-size: 1rem;
  }

  @media (min-width: 768px) {
    width: 2.5rem;
    height: 2.5rem;
    flex-basis: 2.5rem;
    font-size: 1.125rem;
  }

  &--default {
    background: $bg-subtle;
    color: $primary;
  }

  &--correct {
    background: rgba($success, 0.15);
    color: $success;
  }

  &--wrong {
    background: rgba($danger, 0.15);
    color: #fff;
    background: $danger;
  }

  &--disabled {
    background: $bg-subtle;
    color: $text-dim;
  }
}
</style>
