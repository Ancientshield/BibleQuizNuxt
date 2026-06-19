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

  &__label {
    font-size: 1rem;
    font-weight: 500;
    color: $text-primary;
  }

  &__field {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border-radius: 0.625rem;
    background: $bg-card;
    border: 1px solid $border-base;
    color: $text-primary;
    font-size: 1rem;
    outline: none;
    transition: all 0.25s;
    color-scheme: light;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__helper {
    font-size: 1rem;
    color: $text-dim;
  }

  &--focus &__field {
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba($primary, 0.08);
  }

  &--error &__field {
    border-color: $danger;
  }

  &--error &__helper {
    color: $danger;
  }
}
</style>
