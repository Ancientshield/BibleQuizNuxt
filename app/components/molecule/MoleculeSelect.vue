<template>
  <div
    ref="selectRef"
    :class="['m-select', `m-select--${statusClass}`]"
  >
    <label
      v-if="label"
      class="m-select__label"
    >
      {{ label }}
    </label>

    <button
      type="button"
      class="m-select__trigger"
      :disabled="disabled"
      @click="toggle"
    >
      <span :class="['m-select__text', { 'm-select__text--placeholder': !selectedOption }]">
        {{ displayText }}
      </span>
      <Icon
        name="lucide:chevron-down"
        :class="['m-select__arrow', { 'm-select__arrow--open': isOpen }]"
      />
    </button>

    <Transition name="dropdown">
      <div
        v-if="isOpen"
        class="m-select__dropdown"
      >
        <button
          v-for="opt in options"
          :key="opt.value"
          type="button"
          :class="[
            'm-select__option',
            {
              'm-select__option--selected': opt.value === modelValue,
              'm-select__option--disabled': opt.disabled,
            },
          ]"
          :disabled="opt.disabled"
          @click="select(opt)"
        >
          {{ opt.label }}
          <Icon
            v-if="opt.value === modelValue"
            name="lucide:check"
            class="m-select__check"
          />
        </button>
      </div>
    </Transition>

    <p
      v-if="helperText"
      class="m-select__helper"
    >
      {{ helperText }}
    </p>
  </div>
</template>

<script setup lang="ts">
export interface MoleculeSelectOption {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface MoleculeSelectProps {
  modelValue?: string | number;
  options?: MoleculeSelectOption[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  state?: 'regular' | 'error';
  helperText?: string;
}

const props = withDefaults(defineProps<MoleculeSelectProps>(), {
  modelValue: '',
  options: () => [],
  label: '',
  placeholder: '請選擇',
  disabled: false,
  state: 'regular',
  helperText: '',
});

const emit = defineEmits<{
  'update:modelValue': [value: string | number];
  change: [value: string | number];
}>();

const isOpen = ref(false);
const selectRef = ref<HTMLDivElement | null>(null);

const selectedOption = computed(() => props.options.find(o => o.value === props.modelValue));
const displayText = computed(() => selectedOption.value?.label || props.placeholder);

const statusClass = computed(() => {
  if (props.disabled) return 'disabled';
  if (props.state === 'error') return 'error';
  if (isOpen.value) return 'open';
  return 'regular';
});

const toggle = () => {
  if (!props.disabled) isOpen.value = !isOpen.value;
};

const select = (opt: MoleculeSelectOption) => {
  if (opt.disabled) return;
  emit('update:modelValue', opt.value);
  emit('change', opt.value);
  isOpen.value = false;
};

// 點外面關閉
const onClickOutside = (e: MouseEvent) => {
  if (selectRef.value && !selectRef.value.contains(e.target as Node)) {
    isOpen.value = false;
  }
};

onMounted(() => document.addEventListener('click', onClickOutside));
onUnmounted(() => document.removeEventListener('click', onClickOutside));
</script>

<style lang="scss" scoped>
.m-select {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.375rem;

  // ── Label ──
  &__label {
    font-size: 1rem;
    font-weight: 500;
    color: $text-primary;
  }

  // ── Trigger ──
  &__trigger {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    border-radius: 0.625rem;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba($border-base, 0.5);
    color: $text-bright;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.25s;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  &__text {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &--placeholder {
      color: $text-dim;
    }
  }

  &__arrow {
    width: 1rem;
    height: 1rem;
    color: $text-muted;
    flex-shrink: 0;
    transition: transform 0.2s;

    &--open {
      transform: rotate(180deg);
    }
  }

  // ── Dropdown ──
  &__dropdown {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    z-index: 50;
    margin-top: 0.25rem;
    max-height: 14rem;
    overflow-y: auto;
    border-radius: 0.625rem;
    background: rgba(15, 23, 42, 0.95);
    backdrop-filter: blur(16px);
    border: 1px solid rgba($border-base, 0.5);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  &__option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: transparent;
    border: none;
    color: $text-primary;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.15s;
    text-align: left;

    &:hover:not(&--disabled) {
      background: rgba(255, 255, 255, 0.05);
    }

    &--selected {
      color: $accent;
    }

    &--disabled {
      opacity: 0.4;
      cursor: not-allowed;
    }
  }

  &__check {
    width: 1rem;
    height: 1rem;
    color: $accent;
    flex-shrink: 0;
  }

  // ── Helper text ──
  &__helper {
    font-size: 1rem;
    color: $text-dim;
  }

  // ── States ──
  &--open &__trigger {
    border-color: rgba($accent, 0.5);
    box-shadow: 0 0 12px rgba($accent, 0.1);
  }

  &--error &__trigger {
    border-color: rgba($danger, 0.5);
  }

  &--error &__helper {
    color: $danger-light;
  }
}

// ── Dropdown transition ──
.dropdown-enter-active,
.dropdown-leave-active {
  transition: all 0.2s ease;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
