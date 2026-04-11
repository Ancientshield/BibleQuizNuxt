<!--
  MoleculeAuthInput — 帶 icon 和光暈 focus 效果的 input。

  主要用於 auth 頁面（login / forgot-password / reset-password）的表單欄位。
  - icon: 左側的 lucide icon（mail / lock 等）
  - toggleable: 密碼欄位專用，會顯示右側的眼睛圖示切換 show/hide
  - hint: 欄位下方的灰色提示文字（例如「密碼至少 8 個字元」）

  為什麼要自管 `focused` 和 `showPassword`：
  這兩個純 UI 狀態不需要讓外部知道，外部只關心 v-model 的值。
-->
<template>
  <div class="auth-input">
    <div
      class="auth-input__wrapper"
      :class="{ 'auth-input__wrapper--focus': focused }"
    >
      <Icon
        :name="icon"
        class="auth-input__icon"
      />
      <input
        :value="modelValue"
        :type="computedType"
        :placeholder="placeholder"
        :required="required"
        :autocomplete="autocomplete"
        class="auth-input__field"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        @focus="focused = true"
        @blur="focused = false"
      />
      <button
        v-if="toggleable"
        type="button"
        class="auth-input__eye"
        @click="showPassword = !showPassword"
      >
        <Icon
          v-if="showPassword"
          name="lucide:eye"
        />
        <Icon
          v-else
          name="lucide:eye-off"
        />
      </button>
    </div>
    <p
      v-if="hint"
      class="auth-input__hint"
    >
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  modelValue: string;
  icon: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autocomplete?: string;
  toggleable?: boolean;
  hint?: string;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();

const focused = ref(false);
const showPassword = ref(false);

const computedType = computed(() => {
  if (!props.toggleable) return props.type || 'text';
  return showPassword.value ? 'text' : 'password';
});
</script>

<style lang="scss" scoped>
.auth-input {
  display: flex;
  flex-direction: column;

  &__wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0 1rem;
    height: 3.25rem;
    border-radius: 0.75rem;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba($border-base, 0.5);
    transition: all 0.25s;

    &--focus {
      border-color: rgba($accent, 0.5);
      box-shadow: 0 0 16px rgba($accent, 0.15);
      background: rgba(30, 41, 59, 0.8);
    }
  }

  &__icon {
    width: 1.125rem;
    height: 1.125rem;
    color: $text-dim;
    flex-shrink: 0;
    transition: color 0.25s;

    .auth-input__wrapper--focus & {
      color: $accent;
    }
  }

  &__field {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: $text-bright;
    font-size: 0.9375rem;

    &::placeholder {
      color: $text-dim;
    }
  }

  &__eye {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    color: $text-dim;
    padding: 0.25rem;
    transition: color 0.2s;

    svg {
      width: 1.125rem;
      height: 1.125rem;
    }

    &:hover {
      color: $text-muted;
    }
  }

  &__hint {
    margin-top: 0.375rem;
    margin-left: 0.25rem;
    font-size: 0.75rem;
    color: $text-dim;
  }
}
</style>
