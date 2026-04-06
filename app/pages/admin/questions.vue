<template>
  <main class="main">
    <div class="main__container">
      <h1 class="main__title">
        <Icon
          name="lucide:list-checks"
          class="main__title-icon"
        />
        題目審核
      </h1>

      <!-- 篩選 -->
      <div class="aq__filters">
        <button
          v-for="f in filters"
          :key="f.value"
          :class="['aq__filter-btn', { 'aq__filter-btn--active': activeFilter === f.value }]"
          @click="setFilter(f.value)"
        >
          {{ f.label }}
        </button>
      </div>

      <!-- Loading -->
      <div
        v-if="loading"
        class="main__loading"
      >
        載入中...
      </div>

      <!-- 空狀態 -->
      <div
        v-else-if="questions.length === 0"
        class="aq__empty"
      >
        目前沒有{{ activeFilter ? filterLabel : '' }}題目
      </div>

      <!-- 題目列表 -->
      <div
        v-else
        class="aq__list"
      >
        <div
          v-for="q in questions"
          :key="q.id"
          class="aq__card"
        >
          <div class="aq__card-top">
            <span :class="['aq__status', `aq__status--${q.status.toLowerCase()}`]">
              {{ statusLabel(q.status) }}
            </span>
            <span class="aq__meta">#{{ q.id }} · {{ formatDate(q.createdAt) }}</span>
          </div>

          <p class="aq__content">{{ q.content }}</p>

          <div class="aq__options-preview">
            <span
              v-for="opt in q.options"
              :key="opt.id"
              :class="['aq__opt', { 'aq__opt--correct': opt.correct }]"
            >
              {{ opt.content }}
            </span>
          </div>

          <!-- PENDING → 審核操作 -->
          <div
            v-if="q.status === 'PENDING'"
            class="aq__actions"
          >
            <button
              class="aq__publish-btn"
              @click="openPublishModal(q)"
            >
              <Icon name="lucide:check" />
              核准上架
            </button>
            <button
              class="aq__reject-btn"
              @click="handleReject(q.id)"
            >
              <Icon name="lucide:x" />
              不通過
            </button>
          </div>

          <!-- PUBLISHED → 顯示分類和經文 -->
          <div
            v-if="q.status === 'PUBLISHED' && (q.categoryName || q.bibleRef)"
            class="aq__published-info"
          >
            <span v-if="q.categoryName">{{ q.categoryName }}</span>
            <span v-if="q.bibleRef">{{ q.bibleRef }}</span>
          </div>
        </div>
      </div>

      <!-- 核准 Modal -->
      <Teleport to="body">
        <Transition name="modal">
          <div
            v-if="publishTarget"
            class="aq__modal-overlay"
            @click.self="publishTarget = null"
          >
            <div class="aq__modal">
              <h2 class="aq__modal-title">核准上架</h2>
              <p class="aq__modal-desc">指定分類和經文出處：</p>

              <!-- 分類 -->
              <div class="aq__modal-field">
                <label class="aq__modal-label">分類</label>
                <select
                  v-model="publishForm.categoryId"
                  class="aq__modal-select"
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

              <!-- 書卷 -->
              <div class="aq__modal-field">
                <label class="aq__modal-label">書卷</label>
                <select
                  v-model="publishForm.bibleBookId"
                  class="aq__modal-select"
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

              <!-- 章節 -->
              <div class="aq__modal-row">
                <div class="aq__modal-field">
                  <label class="aq__modal-label">章</label>
                  <input
                    v-model.number="publishForm.bibleChapter"
                    type="number"
                    min="1"
                    class="aq__modal-input"
                    placeholder="章"
                  />
                </div>
                <div class="aq__modal-field">
                  <label class="aq__modal-label">起始節</label>
                  <input
                    v-model.number="publishForm.bibleVerseStart"
                    type="number"
                    min="1"
                    class="aq__modal-input"
                    placeholder="節"
                  />
                </div>
                <div class="aq__modal-field">
                  <label class="aq__modal-label">結束節</label>
                  <input
                    v-model.number="publishForm.bibleVerseEnd"
                    type="number"
                    min="1"
                    class="aq__modal-input"
                    placeholder="選填"
                  />
                </div>
              </div>

              <div class="aq__modal-actions">
                <button
                  class="aq__modal-cancel"
                  @click="publishTarget = null"
                >
                  取消
                </button>
                <button
                  class="aq__modal-confirm"
                  :disabled="publishLoading"
                  @click="handlePublish"
                >
                  {{ publishLoading ? '處理中...' : '確認核准' }}
                </button>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] });

interface QuestionItem {
  id: number;
  content: string;
  status: string;
  categoryName: string | null;
  bibleRef: string | null;
  options: { id: number; content: string; correct: boolean }[];
  createdAt: string;
}

interface Category {
  id: number;
  name: string;
}

interface BibleBook {
  id: number;
  name: string;
}

const filters = [
  { label: '全部', value: '' },
  { label: '待審核', value: 'PENDING' },
  { label: '已上架', value: 'PUBLISHED' },
  { label: '未通過', value: 'REJECTED' },
];

const activeFilter = ref('PENDING');
const loading = ref(true);
const questions = ref<QuestionItem[]>([]);

// Lookup data
const categories = ref<Category[]>([]);
const bibleBooks = ref<BibleBook[]>([]);

// Publish modal
const publishTarget = ref<QuestionItem | null>(null);
const publishLoading = ref(false);
const publishForm = reactive({
  categoryId: null as number | null,
  bibleBookId: null as number | null,
  bibleChapter: null as number | null,
  bibleVerseStart: null as number | null,
  bibleVerseEnd: null as number | null,
});

const filterLabel = computed(() => filters.find(f => f.value === activeFilter.value)?.label || '');

const statusLabel = (status: string) => {
  const map: Record<string, string> = { PENDING: '待審核', PUBLISHED: '已上架', REJECTED: '未通過' };
  return map[status] || status;
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
};

const fetchQuestions = async () => {
  loading.value = true;
  try {
    const url = activeFilter.value ? `/api/admin/questions?status=${activeFilter.value}` : '/api/admin/questions';
    questions.value = await useAuthFetch<QuestionItem[]>(url);
  } catch {
    alert('載入失敗');
  } finally {
    loading.value = false;
  }
};

const setFilter = (value: string) => {
  activeFilter.value = value;
  fetchQuestions();
};

const openPublishModal = (q: QuestionItem) => {
  publishTarget.value = q;
  publishForm.categoryId = null;
  publishForm.bibleBookId = null;
  publishForm.bibleChapter = null;
  publishForm.bibleVerseStart = null;
  publishForm.bibleVerseEnd = null;
};

const handlePublish = async () => {
  if (!publishTarget.value) return;
  if (
    !publishForm.categoryId ||
    !publishForm.bibleBookId ||
    !publishForm.bibleChapter ||
    !publishForm.bibleVerseStart
  ) {
    alert('請填寫分類、書卷、章、起始節');
    return;
  }

  publishLoading.value = true;
  try {
    await useAuthFetch(`/api/admin/questions/${publishTarget.value.id}/publish`, {
      method: 'PATCH',
      body: publishForm,
    });
    publishTarget.value = null;
    fetchQuestions();
  } catch (err: unknown) {
    const fetchErr = err as { data?: { message?: string } };
    alert(fetchErr.data?.message || '核准失敗');
  } finally {
    publishLoading.value = false;
  }
};

const handleReject = async (id: number) => {
  if (!confirm('確定這題不通過嗎？')) return;
  try {
    await useAuthFetch(`/api/admin/questions/${id}/reject`, { method: 'PATCH' });
    fetchQuestions();
  } catch {
    alert('操作失敗');
  }
};

// 初始載入
onMounted(async () => {
  await Promise.all([
    fetchQuestions(),
    useAuthFetch<Category[]>('/api/admin/categories').then(d => (categories.value = d)),
    useAuthFetch<BibleBook[]>('/api/admin/bible-books').then(d => (bibleBooks.value = d)),
  ]);
});
</script>

<style lang="scss" scoped>
.aq {
  // ── 篩選列 ──
  &__filters {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1.5rem;
    flex-wrap: wrap;
  }

  &__filter-btn {
    padding: 0.375rem 0.875rem;
    border-radius: 9999px;
    font-size: 0.8125rem;
    font-weight: 500;
    cursor: pointer;
    border: 1px solid rgba($border-base, 0.5);
    background: transparent;
    color: $text-muted;
    transition: all 0.2s;

    &:hover {
      color: $text-bright;
      border-color: rgba(71, 85, 105, 0.7);
    }

    &--active {
      background: rgba($accent, 0.15);
      color: $accent;
      border-color: rgba($accent, 0.4);
    }
  }

  // ── 空狀態 ──
  &__empty {
    text-align: center;
    padding: 3rem;
    color: $text-dim;
  }

  // ── 題目列表 ──
  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__card {
    padding: 1.25rem;
    border-radius: 0.75rem;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba($border-base, 0.5);
  }

  &__card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  &__status {
    font-size: 0.75rem;
    font-weight: 600;
    padding: 0.125rem 0.5rem;
    border-radius: 9999px;

    &--pending {
      background: rgba(251, 191, 36, 0.15);
      color: #fbbf24;
    }

    &--published {
      background: rgba($success, 0.15);
      color: $success;
    }

    &--rejected {
      background: rgba($danger, 0.15);
      color: $danger-light;
    }
  }

  &__meta {
    font-size: 0.75rem;
    color: $text-dim;
  }

  &__content {
    color: $text-bright;
    font-size: 0.9375rem;
    line-height: 1.5;
    margin-bottom: 0.75rem;
  }

  // ── 選項預覽 ──
  &__options-preview {
    display: flex;
    flex-wrap: wrap;
    gap: 0.375rem;
    margin-bottom: 0.75rem;
  }

  &__opt {
    font-size: 0.75rem;
    padding: 0.25rem 0.625rem;
    border-radius: 0.375rem;
    background: rgba(30, 41, 59, 0.8);
    border: 1px solid rgba($border-base, 0.5);
    color: $text-muted;

    &--correct {
      border-color: rgba($success, 0.4);
      color: $success-light;
      background: rgba($success, 0.08);
    }
  }

  // ── 審核操作 ──
  &__actions {
    display: flex;
    gap: 0.5rem;
  }

  &__publish-btn,
  &__reject-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.375rem 0.75rem;
    border-radius: 0.5rem;
    font-size: 0.8125rem;
    font-weight: 600;
    cursor: pointer;
    border: none;
    transition: all 0.2s;

    svg {
      width: 0.875rem;
      height: 0.875rem;
    }
  }

  &__publish-btn {
    background: rgba($success, 0.15);
    color: $success;

    &:hover {
      background: rgba($success, 0.25);
    }
  }

  &__reject-btn {
    background: rgba($danger, 0.1);
    color: $danger-light;

    &:hover {
      background: rgba($danger, 0.2);
    }
  }

  // ── 已上架資訊 ──
  &__published-info {
    display: flex;
    gap: 0.75rem;
    font-size: 0.8125rem;
    color: $text-muted;

    span {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  }

  // ── Modal ──
  &__modal-overlay {
    position: fixed;
    inset: 0;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.6);
    padding: 1rem;
  }

  &__modal {
    width: 100%;
    max-width: 28rem;
    border-radius: 1rem;
    background: rgba($bg-dark, 0.95);
    backdrop-filter: blur(24px);
    border: 1px solid rgba($border-base, 0.5);
    padding: 1.5rem;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
  }

  &__modal-title {
    font-size: 1.25rem;
    font-weight: 700;
    color: $text-bright;
    margin-bottom: 0.25rem;
  }

  &__modal-desc {
    font-size: 0.875rem;
    color: $text-muted;
    margin-bottom: 1.25rem;
  }

  &__modal-field {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
    margin-bottom: 0.75rem;
    flex: 1;
  }

  &__modal-label {
    font-size: 0.8125rem;
    color: $text-primary;
    font-weight: 500;
  }

  &__modal-select,
  &__modal-input {
    padding: 0.5rem 0.75rem;
    border-radius: 0.625rem;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba($border-base, 0.5);
    color: $text-bright;
    font-size: 0.875rem;
    outline: none;
    transition: all 0.25s;

    &:focus {
      border-color: rgba($accent, 0.5);
      box-shadow: 0 0 12px rgba($accent, 0.1);
    }

    option {
      background: #1e293b;
      color: $text-bright;
    }
  }

  &__modal-row {
    display: flex;
    gap: 0.75rem;
  }

  &__modal-actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1.25rem;
  }

  &__modal-cancel {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    background: transparent;
    border: 1px solid rgba($border-base, 0.5);
    color: $text-muted;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: rgba(71, 85, 105, 0.7);
      color: $text-bright;
    }
  }

  &__modal-confirm {
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    background: linear-gradient(to right, $gradient-start, $gradient-end);
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    border: none;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      opacity: 0.9;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
}

// ── Modal Transition ──
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
