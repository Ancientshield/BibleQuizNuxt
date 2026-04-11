<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="target"
        class="pub-modal__overlay"
        @click.self="handleCancel"
      >
        <div class="pub-modal">
          <h2 class="pub-modal__title">核准上架</h2>
          <p class="pub-modal__desc">指定分類和經文出處：</p>

          <div class="pub-modal__field">
            <label class="pub-modal__label">
              <span>分類</span>
              <button
                type="button"
                class="pub-modal__label-action"
                @click="emit('manageCategories')"
              >
                <Icon
                  name="lucide:settings-2"
                  class="pub-modal__label-action-icon"
                />
                管理分類
              </button>
            </label>
            <select
              v-model="form.categoryId"
              class="pub-modal__select"
            >
              <option
                :value="null"
                disabled
              >
                選擇分類
              </option>
              <option
                v-for="c in categories"
                :key="c.id"
                :value="c.id"
              >
                {{ c.name }}
              </option>
            </select>
          </div>

          <div class="pub-modal__field">
            <label class="pub-modal__label">書卷</label>
            <select
              v-model="form.bibleBookId"
              class="pub-modal__select"
            >
              <option
                :value="null"
                disabled
              >
                選擇書卷
              </option>
              <option
                v-for="b in bibleBooks"
                :key="b.id"
                :value="b.id"
              >
                {{ b.name }}
              </option>
            </select>
          </div>

          <div class="pub-modal__row">
            <div class="pub-modal__field">
              <label class="pub-modal__label">章</label>
              <select
                v-model.number="form.bibleChapter"
                class="pub-modal__select"
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
            <div class="pub-modal__field">
              <label class="pub-modal__label">起始節</label>
              <select
                v-model.number="form.bibleVerseStart"
                class="pub-modal__select"
              >
                <option
                  :value="null"
                  disabled
                >
                  節
                </option>
                <option
                  v-for="v in VERSE_OPTIONS"
                  :key="v"
                  :value="v"
                >
                  {{ v }}
                </option>
              </select>
            </div>
            <div class="pub-modal__field">
              <label class="pub-modal__label">結束節</label>
              <select
                v-model.number="form.bibleVerseEnd"
                class="pub-modal__select"
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

          <div class="pub-modal__actions">
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
              {{ loading ? '處理中...' : '確認核准' }}
            </AtomButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * OrganismPublishQuestionModal — 管理者核准題目上架用的 Modal。
 *
 * 把使用者投稿的題目從 PENDING 改為 PUBLISHED，核准時必須指定分類 + 經文出處
 * （投稿人不填這兩個欄位，由管理者在審核時補齊）。
 *
 * Props:
 * - target: 要核准的題目（null 代表關閉）
 * - categories / bibleBooks: 下拉選單資料來源
 *
 * Emits:
 * - close: 使用者取消或核准成功後，父層把 target 設回 null
 * - published: 核准成功，父層 fetchQuestions 更新列表
 * - manageCategories: 使用者點「管理分類」按鈕，父層負責開啟 OrganismCategoriesManagerModal
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
  published: [];
  manageCategories: [];
}>();

const adminApi = useAdminQuestionApi();
const loading = ref(false);

const form = reactive({
  categoryId: null as number | null,
  bibleBookId: null as number | null,
  bibleChapter: null as number | null,
  bibleVerseStart: null as number | null,
  bibleVerseEnd: null as number | null,
});

// 每次打開 Modal 時（target 從 null 變非 null）把表單重置乾淨
watch(
  () => props.target,
  t => {
    if (t) {
      form.categoryId = null;
      form.bibleBookId = null;
      form.bibleChapter = null;
      form.bibleVerseStart = null;
      form.bibleVerseEnd = null;
    }
  }
);

const handleCancel = () => {
  emit('close');
};

const handleSubmit = async () => {
  if (!props.target) return;
  if (!form.categoryId || !form.bibleBookId || !form.bibleChapter || !form.bibleVerseStart) {
    alert('請填寫分類、書卷、章、起始節');
    return;
  }
  loading.value = true;
  try {
    await adminApi.publish(props.target.id, { ...form });
    emit('published');
    emit('close');
  } catch (err) {
    const e = err as { data?: { message?: string } };
    alert(e?.data?.message || '核准失敗');
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.pub-modal {
  width: min(36rem, 92vw);
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
    margin: 0 0 0.5rem;
  }

  &__desc {
    font-size: 1rem;
    color: $text-muted;
    margin: 0 0 1.25rem;
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

  &__select {
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
    appearance: none;
    padding-right: 2.25rem;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem center;
    background-size: 1rem;
    cursor: pointer;

    &:focus {
      border-color: rgba($accent, 0.5);
      box-shadow: 0 0 12px rgba($accent, 0.1);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    option {
      background: #1e293b;
      color: $text-bright;
    }
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
