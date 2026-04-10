<template>
  <div :class="['a-input', `a-input--${statusClass}`]">
    <label
      v-if="label"
      :for="id || undefined"
      class="a-input__label"
    >
      {{ label }}
    </label>
    <input
      :id="id || undefined"
      :value="modelValue"
      :type="type"
      :name="name || undefined"
      :placeholder="placeholder"
      :disabled="disabled"
      :autocomplete="autocomplete || undefined"
      class="a-input__field"
      @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      @focus="onFocus"
      @blur="onBlur"
      @keydown.enter="emit('enter', $event)"
    />
    <p
      v-if="helperText"
      class="a-input__helper"
    >
      {{ helperText }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface AtomInputProps {
  modelValue?: string;
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  state?: 'regular' | 'ready' | 'typing' | 'filled' | 'error';
  helperText?: string;
  name?: string;
  id?: string;
  type?: string;
  autocomplete?: string;
}

const props = withDefaults(defineProps<AtomInputProps>(), {
  modelValue: '',
  label: '',
  placeholder: '',
  disabled: false,
  state: 'regular',
  helperText: '',
  name: '',
  id: '',
  type: 'text',
  autocomplete: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string];
  focus: [event: FocusEvent];
  blur: [event: FocusEvent];
  enter: [event: KeyboardEvent];
}>();

const isFocused = ref(false);

const onFocus = (e: FocusEvent) => {
  isFocused.value = true;
  emit('focus', e);
};

const onBlur = (e: FocusEvent) => {
  isFocused.value = false;
  emit('blur', e);
};

const statusClass = computed(() => {
  if (props.disabled) return 'disabled';
  if (props.state === 'error') return 'error';
  if (isFocused.value) return 'focus';
  if (props.modelValue) return 'filled';
  return 'regular';
});
</script>

<style lang="scss" scoped>
.a-input {
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

    &::placeholder {
      color: $text-dim;
    }

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
    box-shadow: 0 0 12px rgba($danger, 0.1);
  }

  &--error &__helper {
    color: $danger-light;
  }
}
</style>
