<template>
  <form
    class="q-form"
    @submit.prevent="handleSubmit"
  >
    <!-- 題目內容 -->
    <div class="q-form__field">
      <label class="q-form__label">題目內容</label>
      <textarea
        v-model="content"
        class="q-form__textarea"
        placeholder="輸入題目文字..."
        rows="3"
        required
      />
    </div>

    <!-- 選項列表 -->
    <div class="q-form__field">
      <label class="q-form__label">題目答案</label>
      <p class="q-form__hint">輸入四個選項，並選擇一個選項作為正確答案</p>

      <div class="q-form__options">
        <div
          v-for="(opt, i) in options"
          :key="i"
          class="q-form__option"
        >
          <!-- 正確答案 radio -->
          <label class="q-form__radio-wrapper">
            <input
              type="radio"
              :name="'correct-' + formId"
              :value="i"
              :checked="correctIndex === i"
              class="q-form__radio"
              @change="correctIndex = i"
            />
            <span class="q-form__radio-dot" />
          </label>

          <!-- 選項文字 -->
          <input
            v-model="opt.content"
            class="q-form__option-input"
            :placeholder="`選項 ${String.fromCharCode(65 + i)}`"
            required
          />
        </div>
      </div>
    </div>

    <!-- 錯誤訊息 -->
    <Transition name="fade">
      <div
        v-if="errorMsg"
        class="q-form__error"
      >
        <Icon
          name="lucide:circle-alert"
          class="q-form__error-icon"
        />
        {{ errorMsg }}
      </div>
    </Transition>

    <!-- 送出按鈕 -->
    <button
      type="submit"
      class="q-form__submit"
      :disabled="loading"
    >
      {{ loading ? '處理中...' : submitText }}
    </button>
  </form>
</template>

<script setup lang="ts">
interface OptionItem {
  content: string;
}

interface QuestionFormData {
  content: string;
  options: { content: string; correct: boolean }[];
}

interface InitialData {
  content: string;
  options: { content: string; correct: boolean }[];
}

const props = withDefaults(
  defineProps<{
    initialData?: InitialData;
    loading?: boolean;
    submitText?: string;
  }>(),
  { loading: false, submitText: '送出' }
);

const emit = defineEmits<{
  submit: [data: QuestionFormData];
}>();

const formId = useId();
const errorMsg = ref('');

// ── 表單狀態 ──
const content = ref(props.initialData?.content ?? '');
const correctIndex = ref(props.initialData ? props.initialData.options.findIndex(o => o.correct) : 0);
const options = ref<OptionItem[]>(
  props.initialData
    ? props.initialData.options.map(o => ({ content: o.content }))
    : [{ content: '' }, { content: '' }, { content: '' }, { content: '' }]
);

// 編輯模式：initialData 變化時重設表單
watch(
  () => props.initialData,
  val => {
    if (val) {
      content.value = val.content;
      correctIndex.value = val.options.findIndex(o => o.correct);
      options.value = val.options.map(o => ({ content: o.content }));
    }
  }
);

const handleSubmit = () => {
  errorMsg.value = '';

  if (!content.value.trim()) {
    errorMsg.value = '請輸入題目內容';
    return;
  }
  if (options.value.some(o => !o.content.trim())) {
    errorMsg.value = '所有選項都必須填寫';
    return;
  }

  emit('submit', {
    content: content.value.trim(),
    options: options.value.map((o, i) => ({
      content: o.content.trim(),
      correct: i === correctIndex.value,
    })),
  });
};
</script>

<style lang="scss" scoped>
.q-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;

  // ── 欄位 ──
  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__label {
    color: $text-primary;
    font-size: 0.875rem;
    font-weight: 600;
  }

  // ── 題目 textarea ──
  &__textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba($border-base, 0.5);
    color: $text-bright;
    font-size: 0.9375rem;
    resize: vertical;
    outline: none;
    transition: all 0.25s;
    font-family: inherit;

    &::placeholder {
      color: $text-dim;
    }

    &:focus {
      border-color: rgba($accent, 0.5);
      box-shadow: 0 0 16px rgba($accent, 0.15);
      background: rgba(30, 41, 59, 0.8);
    }
  }

  // ── 選項列表 ──
  &__options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__option {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  // ── 提示文字 ──
  &__hint {
    color: $text-dim;
    font-size: 1rem;
    margin-top: -0.25rem;
  }

  // ── Radio 按鈕（自訂樣式） ──
  &__radio-wrapper {
    position: relative;
    flex-shrink: 0;
    cursor: pointer;
  }

  &__radio {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .q-form__radio-dot {
      border-color: $accent;
      background: $accent;
      box-shadow: inset 0 0 0 3px rgba($bg-dark, 0.8);
    }
  }

  &__radio-dot {
    display: block;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    border: 2px solid rgba(71, 85, 105, 0.8);
    background: transparent;
    transition: all 0.2s;
  }

  // ── 選項 input ──
  &__option-input {
    flex: 1;
    padding: 0.625rem 0.875rem;
    border-radius: 0.625rem;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba($border-base, 0.5);
    color: $text-bright;
    font-size: 0.875rem;
    outline: none;
    transition: all 0.25s;

    &::placeholder {
      color: $text-dim;
    }

    &:focus {
      border-color: rgba($accent, 0.5);
      box-shadow: 0 0 12px rgba($accent, 0.1);
      background: rgba(30, 41, 59, 0.8);
    }
  }

  // ── 錯誤訊息 ──
  &__error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background: rgba($danger, 0.1);
    border: 1px solid rgba($danger, 0.3);
    color: #fca5a5;
    font-size: 0.875rem;
  }

  &__error-icon {
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
    color: $danger;
  }

  // ── 送出按鈕 ──
  &__submit {
    width: 100%;
    padding: 0.75rem;
    border-radius: 0.75rem;
    background: linear-gradient(to right, $gradient-start, $gradient-end);
    color: white;
    font-weight: 700;
    font-size: 1rem;
    border: none;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      opacity: 0.9;
      transform: scale(1.01);
    }

    &:active {
      transform: scale(0.98);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      transform: none;
    }
  }
}

// ── Transition ──
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
