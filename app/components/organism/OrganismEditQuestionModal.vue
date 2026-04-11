<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="target"
        class="edit-modal__overlay"
        @click.self="handleCancel"
      >
        <div class="edit-modal">
          <h2 class="edit-modal__title">編輯題目 #{{ target.id }}</h2>

          <!-- 題目內容 -->
          <div class="edit-modal__field">
            <label class="edit-modal__label">題目內容</label>
            <textarea
              v-model="form.content"
              class="edit-modal__textarea"
              rows="3"
            />
          </div>

          <!-- 選項 -->
          <div class="edit-modal__field">
            <label class="edit-modal__label">選項（選一個正確答案）</label>
            <div class="edit-modal__options">
              <div
                v-for="(opt, i) in form.options"
                :key="i"
                class="edit-modal__option"
              >
                <label class="edit-modal__radio-wrapper">
                  <input
                    type="radio"
                    name="edit-correct"
                    :value="i"
                    :checked="correctIndex === i"
                    class="edit-modal__radio"
                    @change="correctIndex = i"
                  />
                  <span class="edit-modal__radio-dot" />
                </label>
                <input
                  v-model="opt.content"
                  class="edit-modal__input"
                  :placeholder="`選項 ${String.fromCharCode(65 + i)}`"
                />
              </div>
            </div>
          </div>

          <!-- 分類 -->
          <div class="edit-modal__field">
            <label class="edit-modal__label">
              <span>分類</span>
              <button
                type="button"
                class="edit-modal__label-action"
                @click="emit('manageCategories')"
              >
                <Icon
                  name="lucide:settings-2"
                  class="edit-modal__label-action-icon"
                />
                管理分類
              </button>
            </label>
            <select
              v-model="form.categoryId"
              class="edit-modal__select"
            >
              <option :value="null">未指定</option>
              <option
                v-for="c in categories"
                :key="c.id"
                :value="c.id"
              >
                {{ c.name }}
              </option>
            </select>
          </div>

          <!-- 書卷 -->
          <div class="edit-modal__field">
            <label class="edit-modal__label">書卷</label>
            <select
              v-model="form.bibleBookId"
              class="edit-modal__select"
            >
              <option :value="null">未指定</option>
              <option
                v-for="b in bibleBooks"
                :key="b.id"
                :value="b.id"
              >
                {{ b.name }}
              </option>
            </select>
          </div>

          <!-- 章節 -->
          <div class="edit-modal__row">
            <div class="edit-modal__field">
              <label class="edit-modal__label">章</label>
              <select
                v-model.number="form.bibleChapter"
                class="edit-modal__select"
                :disabled="!form.bibleBookId"
              >
                <option
                  :value="null"
                  disabled
                >
                  選擇章
                </option>
                <option
                  v-for="ch in getChapterOptions(form.bibleBookId)"
                  :key="ch"
                  :value="ch"
                >
                  {{ ch }}
                </option>
              </select>
            </div>
            <div class="edit-modal__field">
              <label class="edit-modal__label">起始節</label>
              <select
                v-model.number="form.bibleVerseStart"
                class="edit-modal__select"
              >
                <option :value="null">節</option>
                <option
                  v-for="v in VERSE_OPTIONS"
                  :key="v"
                  :value="v"
                >
                  {{ v }}
                </option>
              </select>
            </div>
            <div class="edit-modal__field">
              <label class="edit-modal__label">結束節</label>
              <select
                v-model.number="form.bibleVerseEnd"
                class="edit-modal__select"
              >
                <option :value="null">選填</option>
                <option
                  v-for="v in VERSE_OPTIONS"
                  :key="v"
                  :value="v"
                >
                  {{ v }}
                </option>
              </select>
            </div>
          </div>

          <div class="edit-modal__actions">
            <AtomButton
              appearance="outline-view"
              @click="handleCancel"
            >
              取消
            </AtomButton>
            <AtomButton
              :disabled="loading"
              @click="handleSubmit"
            >
              {{ loading ? '處理中...' : '儲存' }}
            </AtomButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * OrganismEditQuestionModal — 管理者編輯題目 Modal（可改任何狀態的題目）。
 *
 * 跟投稿人 editing 的差異：管理者可以改題目內容、選項、正確答案、分類、
 * 經文出處；投稿人只能改自己的 PENDING 題目。
 *
 * Props: target / categories / bibleBooks（三者都是 parent 傳進來的完整資料）
 * Emits:
 *  - close: 使用者取消或儲存成功，父層把 target 設回 null
 *  - updated: 儲存成功，父層 fetchQuestions 更新列表
 *  - manageCategories: 點「管理分類」按鈕
 */
import type { AdminBibleBook, AdminCategory, AdminQuestionItem } from '~/composables/useAdminQuestionApi';

interface Props {
  target: AdminQuestionItem | null;
  categories: AdminCategory[];
  bibleBooks: AdminBibleBook[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
  updated: [];
  manageCategories: [];
}>();

const adminApi = useAdminQuestionApi();
const loading = ref(false);
const correctIndex = ref(0);

const form = reactive({
  content: '',
  options: [{ content: '' }, { content: '' }, { content: '' }, { content: '' }] as { content: string }[],
  categoryId: null as number | null,
  bibleBookId: null as number | null,
  bibleChapter: null as number | null,
  bibleVerseStart: null as number | null,
  bibleVerseEnd: null as number | null,
});

// 每次打開 Modal（target 從 null 變非 null）把既有題目資料倒進 form
watch(
  () => props.target,
  t => {
    if (!t) return;
    form.content = t.content;
    form.options = t.options.map(o => ({ content: o.content }));
    while (form.options.length < 4) form.options.push({ content: '' });
    correctIndex.value = t.options.findIndex(o => o.correct);
    form.categoryId = t.categoryId;
    form.bibleBookId = t.bibleBookId;
    form.bibleChapter = t.bibleChapter;
    form.bibleVerseStart = t.bibleVerseStart;
    form.bibleVerseEnd = t.bibleVerseEnd;
  },
  { immediate: true }
);

const handleCancel = () => {
  emit('close');
};

const handleSubmit = async () => {
  if (!props.target) return;
  if (!form.content.trim()) {
    alert('題目內容不能為空');
    return;
  }
  const nonEmpty = form.options.filter(o => o.content.trim());
  if (nonEmpty.length < 2) {
    alert('至少需要 2 個選項');
    return;
  }
  // 先把 correct flag 附上再過濾，避免 index 錯位
  const allOptions = form.options.map((o, i) => ({
    content: o.content.trim(),
    correct: i === correctIndex.value,
  }));
  const validOptions = allOptions.filter(o => o.content);
  if (!validOptions.some(o => o.correct)) {
    alert('正確答案的選項不能為空');
    return;
  }

  loading.value = true;
  try {
    await adminApi.update(props.target.id, {
      content: form.content.trim(),
      options: validOptions,
      categoryId: form.categoryId,
      bibleBookId: form.bibleBookId,
      bibleChapter: form.bibleChapter,
      bibleVerseStart: form.bibleVerseStart,
      bibleVerseEnd: form.bibleVerseEnd,
    });
    emit('updated');
    emit('close');
  } catch (err) {
    const e = err as { data?: { message?: string } };
    alert(e?.data?.message || '編輯失敗');
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.edit-modal {
  width: min(42rem, 92vw);
  max-height: 88vh;
  overflow-y: auto;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba($border-base, 0.6);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(24px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);

  &__overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    z-index: 100;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 700;
    color: $text-bright;
    margin: 0 0 1rem;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    margin-bottom: 1rem;
    flex: 1;
  }

  &__label {
    font-size: 1rem;
    color: $text-primary;
    font-weight: 500;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
  }

  &__label-action {
    display: inline-flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.625rem;
    font-size: 1rem;
    color: $text-muted;
    background: transparent;
    border: 1px solid rgba($border-base, 0.5);
    border-radius: 9999px;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: $accent;
      border-color: rgba($accent, 0.5);
      background: rgba($accent, 0.08);
    }
  }

  &__label-action-icon {
    width: 1rem;
    height: 1rem;
  }

  &__select,
  &__input,
  &__textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 0.5rem 0.75rem;
    border-radius: 0.625rem;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba($border-base, 0.5);
    color: $text-bright;
    font-size: 1rem;
    outline: none;
    transition: all 0.25s;

    &:focus {
      border-color: rgba($accent, 0.5);
      box-shadow: 0 0 12px rgba($accent, 0.1);
    }
  }

  &__select {
    appearance: none;
    padding-right: 2.25rem;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1rem;
    cursor: pointer;

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    option {
      background: #1e293b;
      color: $text-bright;
    }
  }

  &__textarea {
    resize: vertical;
    font-family: inherit;
  }

  &__row {
    display: flex;
    gap: 0.75rem;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1.25rem;
  }

  // 編輯 Modal 特有：選項列表 + radio button
  &__options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__option {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .edit-modal__input {
      flex: 1;
      min-width: 0;
    }
  }

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

    &:checked + .edit-modal__radio-dot {
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
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
