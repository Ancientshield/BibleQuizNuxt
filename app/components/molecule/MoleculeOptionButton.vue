<template>
  <button
    :disabled="disabled"
    :class="[stateClass, { 'option-btn--hovered': isHovered, 'option-btn--eliminated': eliminated }]"
    class="option-btn"
    @click="handleClick"
    @pointerenter="handlePointerEnter"
    @pointerleave="handlePointerLeave"
  >
    <span
      v-if="ripple"
      class="option-btn__ripple"
      :style="{
        left: ripple.x + 'px',
        top: ripple.y + 'px',
      }"
    />

    <div class="option-btn__content">
      <div class="option-btn__left">
        <AtomOptionBadge
          :label="label"
          :state="state"
        />
        <span>{{ text }}</span>
      </div>

      <span
        v-if="pollPercentage != null && state === 'default'"
        class="option-btn__poll"
      >
        {{ pollPercentage }}%
      </span>
      <AtomResultIcon
        v-else-if="state === 'correct'"
        type="correct"
      />
      <AtomResultIcon
        v-else-if="state === 'wrong'"
        type="wrong"
      />
    </div>
  </button>
</template>

<script setup lang="ts">
export type OptionState = 'default' | 'correct' | 'wrong' | 'disabled';

const props = withDefaults(
  defineProps<{
    label: string;
    text: string;
    state: OptionState;
    disabled: boolean;
    eliminated?: boolean;
    pollPercentage?: number | null;
  }>(),
  { eliminated: false, pollPercentage: null }
);

interface Emits {
  select: [label: string, event: MouseEvent];
}

const emit = defineEmits<Emits>();

const stateClass = computed(() => `option-btn--${props.state}`);

const isHovered = ref(false);

const handlePointerEnter = (e: PointerEvent) => {
  if (e.pointerType === 'mouse' && !props.disabled) isHovered.value = true;
};

const handlePointerLeave = () => {
  isHovered.value = false;
};

const ripple = ref<{ x: number; y: number } | null>(null);

const handleClick = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  ripple.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };

  setTimeout(() => {
    ripple.value = null;
  }, 600);

  emit('select', props.label, e);
};
</script>

<style lang="scss" scoped>
.option-btn {
  position: relative;
  overflow: hidden;
  border-radius: 0.75rem;
  padding: 0.75rem;
  font-weight: 600;
  font-size: 1rem;
  text-align: left;
  transition: all 0.3s ease-out;
  border: 2px solid;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;

  @media (min-width: 390px) {
    padding: 0.875rem;
    font-size: 1.0625rem;
  }

  @media (min-width: 768px) {
    border-radius: 1rem;
    padding: 1.5rem;
    font-size: 1.25rem;
  }

  &:disabled {
    cursor: not-allowed;
  }

  &:focus-visible {
    outline: 2px solid $primary;
    outline-offset: 2px;
  }

  &:focus:not(:focus-visible) {
    outline: none;
    box-shadow: inherit;
  }

  &--default {
    background: $bg-card;
    border-color: $border-base;
    color: $text-primary;

    @media (hover: hover) {
      &.option-btn--hovered {
        transform: scale(1.02);
        border-color: $primary;
        box-shadow: 0 2px 12px rgba($primary, 0.12);
      }
    }
  }

  &--correct {
    background: rgba($success, 0.06);
    border-color: $success;
    color: $text-primary;
  }

  &--wrong {
    background: rgba($danger, 0.06);
    border-color: $danger;
    color: $text-primary;
    animation: shake 0.5s ease-in-out;
  }

  &--disabled {
    background: $bg-subtle;
    border-color: rgba($border-base, 0.5);
    color: $text-dim;
  }

  &--eliminated {
    opacity: 0.35;
    background: $bg-subtle;
    border-color: rgba($border-base, 0.3);
    color: $text-dim;
    text-decoration: line-through;
    transition:
      opacity 0.4s ease,
      background 0.4s ease;
  }

  &__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 0.625rem;
    min-width: 0;

    @media (min-width: 768px) {
      gap: 1rem;
    }
  }

  &__poll {
    font-size: 1rem;
    font-weight: 700;
    color: $accent;
    white-space: nowrap;
  }

  &__ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba($primary, 0.12);
    width: 10px;
    height: 10px;
    transform: translate(-50%, -50%) scale(1);
    pointer-events: none;
    will-change: transform, opacity;
    animation: ripple 0.6s ease-out forwards;
  }
}

@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(50);
    opacity: 0;
  }
}
</style>
