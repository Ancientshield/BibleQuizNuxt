<template>
  <button
    type="button"
    class="social-btn"
    @click="$emit('click')"
  >
    <Icon
      :name="icon"
      class="social-btn__icon"
      :style="color ? { color } : undefined"
    />
    <span class="social-btn__text">使用 {{ label }} 繼續</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  label: string;
  color?: string;
}>();

defineEmits<{
  click: [];
}>();
</script>

<style lang="scss" scoped>
.social-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: $bg-card;
  border: 1px solid $border-base;
  color: $text-primary;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.25s;

  &:hover {
    background: $bg-subtle;
    border-color: $border-focus;
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }

  &:active {
    transform: translateY(0);
  }

  &__icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }

  &__text {
    font-weight: 500;
  }
}
</style>
