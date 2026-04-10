<template>
  <div :class="['m-date', `m-date--${statusClass}`]">
    <label
      v-if="label"
      class="m-date__label"
    >
      {{ label }}
    </label>
    <input
      type="date"
      :value="modelValue"
      :placeholder="placeholder"
      :disabled="disabled"
      class="m-date__field"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @focus="isFocused = true"
      @blur="isFocused = false"
    />
    <p
      v-if="helperText"
      class="m-date__helper"
    >
      {{ helperText }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface MoleculeDatePickerProps {
  modelValue?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  state?: 'regular' | 'error';
  helperText?: string;
}

const props = withDefaults(defineProps<MoleculeDatePickerProps>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  disabled: false,
  state: 'regular',
  helperText: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

const isFocused = ref(false);

const statusClass = computed(() => {
  if (props.disabled) return 'disabled';
  if (props.state === 'error') return 'error';
  if (isFocused.value) return 'focus';
  if (props.modelValue) return 'filled';
  return 'regular';
});
</script>

<style lang="scss" scoped>
.m-date {
  display: flex;
  flex-direction: column;
  gap: 0.375rem;

  // ── Label ──
  &__label {
    font-size: 1rem;
    font-weight: 500;
    color: $text-primary;
  }

  // ── Input ──
  &__field {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border-radius: 0.625rem;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba($border-base, 0.5);
    color: $text-bright;
    font-size: 1rem;
    outline: none;
    transition: all 0.25s;
    color-scheme: dark;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  // ── Helper text ──
  &__helper {
    font-size: 1rem;
    color: $text-dim;
  }

  // ── States ──
  &--focus &__field {
    border-color: rgba($accent, 0.5);
    box-shadow: 0 0 12px rgba($accent, 0.1);
    background: rgba(30, 41, 59, 0.8);
  }

  &--error &__field {
    border-color: rgba($danger, 0.5);
  }

  &--error &__helper {
    color: $danger-light;
  }
}
</style>
