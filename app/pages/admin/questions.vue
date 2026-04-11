<template>
  <main class="main">
    <div class="main__container aq__wide-container">
      <h1 class="main__title">
        <Icon
          name="lucide:settings"
          class="main__title-icon"
        />
        進階管理
      </h1>

      <!-- ══ Tab 切換 ══ -->
      <MoleculeTabs
        :model-value="activeTab"
        :items="tabItems"
        @update:model-value="switchTab"
      />

      <!-- ══ 篩選列 ══ -->
      <OrganismFilterBar
        @search="handleSearch"
        @clear="handleClear"
      >
        <MoleculeSelect
          v-model="filters.status"
          label="狀態"
          :options="statusOptions"
          placeholder="全部狀態"
        />
        <MoleculeSelect
          v-model="filters.categoryId"
          label="分類"
          :options="categoryOptions"
          placeholder="全部分類"
        />
        <AtomInput
          v-model="filters.keyword"
          label="題目"
          placeholder="搜尋題目內容…"
          @enter="handleSearch"
        />
        <AtomInput
          v-model="filters.optionKeyword"
          label="選項"
          placeholder="搜尋選項內容…"
          @enter="handleSearch"
        />
        <AtomInput
          v-model="filters.author"
          label="作者"
          placeholder="搜尋暱稱或 Email…"
          @enter="handleSearch"
        />
        <MoleculeDatePicker
          v-model="filters.dateFrom"
          label="日期起"
        />
        <MoleculeDatePicker
          v-model="filters.dateTo"
          label="日期迄"
        />
      </OrganismFilterBar>

      <!-- ══ Loading ══ -->
      <div
        v-if="loading"
        class="main__loading"
      >
        載入中...
      </div>

      <!-- ══ 空狀態 ══ -->
      <div
        v-else-if="questions.length === 0"
        class="aq__empty"
      >
        沒有符合條件的題目
      </div>

      <!-- ══ Tab 1：題目管理（卡片） ══ -->
      <template v-else-if="activeTab === 'manage'">
        <div class="aq__list">
          <div
            v-for="q in questions"
            :key="q.id"
            class="aq__card"
          >
            <div class="aq__card-top">
              <span :class="['aq__status', `aq__status--${q.status.toLowerCase()}`]">
                {{ statusLabel(q.status) }}
              </span>
              <span class="aq__meta">
                #{{ q.id }}
                <template v-if="q.authorName">· {{ q.authorName }}</template>
                · {{ formatDate(q.createdAt) }}
              </span>
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

            <div
              v-if="q.categoryName || q.bibleRef"
              class="aq__ref-info"
            >
              <span v-if="q.categoryName">{{ q.categoryName }}</span>
              <span v-if="q.bibleRef">{{ q.bibleRef }}</span>
            </div>

            <div class="aq__actions">
              <AtomButton
                v-if="q.status === 'PENDING'"
                variant="positive"
                size="button-s"
                appearance="outline-view"
                @click="openPublishModal(q)"
              >
                <Icon name="lucide:check" />
                核准
              </AtomButton>
              <AtomButton
                v-if="q.status === 'PENDING'"
                variant="danger"
                size="button-s"
                appearance="outline-view"
                @click="handleReject(q.id)"
              >
                <Icon name="lucide:x" />
                退回
              </AtomButton>
              <AtomButton
                variant="primary"
                size="button-s"
                appearance="outline-view"
                @click="openEditModal(q)"
              >
                <Icon name="lucide:pencil" />
                編輯
              </AtomButton>
              <AtomButton
                variant="danger"
                size="button-s"
                appearance="text-view"
                @click="handleDelete(q.id)"
              >
                <Icon name="lucide:trash-2" />
                刪除
              </AtomButton>
            </div>
          </div>
        </div>
      </template>

      <!-- ══ Tab 2：題目統計 ══ -->
      <template v-else-if="activeTab === 'stats'">
        <AtomTable
          :columns="statsColumns"
          :data="statsTableData"
          :hoverable="true"
          empty-text="沒有作答紀錄"
          @sort-change="handleSortChange"
        >
          <template #cell-accuracyRate="{ value }">
            <span
              v-if="value != null"
              :class="accuracyClass(value as number)"
            >
              {{ value }}%
            </span>
            <span
              v-else
              class="aq__no-data"
            >
              —
            </span>
          </template>
        </AtomTable>
      </template>

      <!-- ══ Tab 3：選項統計 ══ -->
      <template v-else-if="activeTab === 'options'">
        <AtomTable
          :columns="optionColumns"
          :data="optionTableData"
          :hoverable="true"
          empty-text="沒有作答紀錄"
          @sort-change="handleOptionSortChange"
        >
          <template #cell-isCorrect="{ value }">
            <span :class="value ? 'aq__correct-yes' : 'aq__correct-no'">
              {{ value ? '✓' : '✗' }}
            </span>
          </template>
          <template #cell-selectionRate="{ value }">
            {{ value != null ? `${value}%` : '—' }}
          </template>
        </AtomTable>
      </template>

      <!-- ══ 分頁 ══ -->
      <AtomPagination
        :total="totalElements"
        :page-size="PAGE_SIZE"
        :current-page="currentPage"
        @update:current-page="onPageChange"
      />

      <!-- ══ 核准 Modal ══ -->
      <OrganismPublishQuestionModal
        :target="publishTarget"
        :categories="categories"
        :bible-books="bibleBooks"
        @close="publishTarget = null"
        @published="fetchQuestions"
        @manage-categories="openCategoriesManager"
      />

      <!-- ══ 編輯 Modal ══ -->
      <OrganismEditQuestionModal
        :target="editTarget"
        :categories="categories"
        :bible-books="bibleBooks"
        @close="editTarget = null"
        @updated="fetchQuestions"
        @manage-categories="openCategoriesManager"
      />

      <!-- ══ 管理分類 Modal ══ -->
      <OrganismCategoriesManagerModal
        v-model="categoriesManagerOpen"
        :categories="categories"
        @refresh="reloadCategories"
      />
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] });

const PAGE_SIZE = 10;

import type {
  AdminQuestionItem as QuestionItem,
  AdminCategory as Category,
  AdminBibleBook as BibleBook,
} from '~/composables/useAdminQuestionApi';

const adminApi = useAdminQuestionApi();

// 書卷章數 / 節數選單邏輯改放 utils/bibleReference.ts，被兩個 Modal 共用

// ── Tab ──

type TabKey = 'manage' | 'stats' | 'options';

const activeTab = ref<TabKey>('manage');
const sortField = ref<'totalAnswered' | 'accuracyRate' | ''>('');
const sortDir = ref<'asc' | 'desc'>('desc');

const tabItems = [
  { value: 'manage', label: '題目管理', icon: 'lucide:list' },
  { value: 'stats', label: '題目統計', icon: 'lucide:bar-chart-3' },
  { value: 'options', label: '選項統計', icon: 'lucide:list' },
];

const switchTab = (tab: string) => {
  const next = tab as TabKey;
  if (activeTab.value === next) return;
  activeTab.value = next;
  currentPage.value = 1;
  sortField.value = '';
  fetchQuestions();
};

// ── 統計 Tab 用 AtomTable ──

import type { TableColumn, SortState } from '~/components/atom/AtomTable.vue';

const statsColumns: TableColumn[] = [
  { key: 'id', label: '#', width: '4rem', align: 'center' },
  { key: 'content', label: '題目', minWidth: '15rem' },
  { key: 'totalAnswered', label: '被答次數', width: '7rem', align: 'center', sortable: true },
  { key: 'accuracyRate', label: '答對率', width: '6rem', align: 'center', sortable: true },
];

const statsTableData = computed(() => {
  const data = questions.value.map(q => ({
    ...q,
    id: q.id,
    content: q.content,
    totalAnswered: q.totalAnswered ?? 0,
    accuracyRate: q.accuracyRate,
    mostSelectedWrongOption: q.mostSelectedWrongOption,
  }));
  if (!sortField.value) return data;
  const f = sortField.value;
  const dir = sortDir.value === 'asc' ? 1 : -1;
  return [...data].sort((a, b) => {
    const va = (a[f] as number) ?? 0;
    const vb = (b[f] as number) ?? 0;
    return (va - vb) * dir;
  });
});

const handleSortChange = (state: SortState) => {
  sortField.value = (state.order ? state.key : '') as typeof sortField.value;
  sortDir.value = state.order === 'asc' ? 'asc' : 'desc';
};

// ── 選項統計 Tab ──

const optionColumns: TableColumn[] = [
  { key: 'questionId', label: '#', width: '4rem', align: 'center' },
  { key: 'questionContent', label: '題目', minWidth: '12rem' },
  { key: 'optionContent', label: '選項內容', minWidth: '8rem' },
  { key: 'isCorrect', label: '正確答案', width: '6rem', align: 'center' },
  { key: 'selectedCount', label: '被選次數', width: '7rem', align: 'center', sortable: true },
  { key: 'selectionRate', label: '被選率', width: '6rem', align: 'center', sortable: true },
];

const optionSortField = ref('');
const optionSortDir = ref<'asc' | 'desc'>('desc');

// 攤平：一題四個選項 → 四列
const optionTableData = computed(() => {
  const rows: Record<string, unknown>[] = [];
  for (const q of questions.value) {
    const total = q.totalAnswered ?? 0;
    for (const opt of q.options) {
      const count = opt.selectedCount ?? 0;
      rows.push({
        questionId: q.id,
        questionContent: q.content,
        optionContent: opt.content,
        isCorrect: opt.correct,
        selectedCount: count,
        selectionRate: total > 0 ? Math.round((count / total) * 1000) / 10 : null,
      });
    }
  }
  if (!optionSortField.value) return rows;
  const f = optionSortField.value;
  const dir = optionSortDir.value === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const va = (a[f] as number) ?? 0;
    const vb = (b[f] as number) ?? 0;
    return (va - vb) * dir;
  });
});

const handleOptionSortChange = (state: SortState) => {
  optionSortField.value = state.order ? state.key : '';
  optionSortDir.value = state.order === 'asc' ? 'asc' : 'desc';
};

const accuracyClass = (rate: number) => {
  if (rate >= 70) return 'aq__accuracy--high';
  if (rate >= 40) return 'aq__accuracy--mid';
  return 'aq__accuracy--low';
};

// ── 篩選狀態 ──

const filters = reactive({
  status: 'PENDING' as string | number,
  categoryId: '' as string | number,
  keyword: '',
  optionKeyword: '',
  author: '',
  dateFrom: '',
  dateTo: '',
});

const statusOptions = [
  { label: '全部狀態', value: '' },
  { label: '待審核', value: 'PENDING' },
  { label: '已上架', value: 'PUBLISHED' },
  { label: '未通過', value: 'REJECTED' },
];

// ── 資料 ──

const loading = ref(true);
const questions = ref<QuestionItem[]>([]);
const totalElements = ref(0);
const currentPage = ref(1);
const categories = ref<Category[]>([]);
const bibleBooks = ref<BibleBook[]>([]);

const categoryOptions = computed(() => [
  { label: '全部分類', value: '' as string | number },
  ...categories.value.map(c => ({ label: c.name, value: c.id as string | number })),
]);

// ── 核准 Modal target ──
// 表單 state 跟呼叫邏輯都在 OrganismPublishQuestionModal 裡，這邊只保留 target
const publishTarget = ref<QuestionItem | null>(null);

// ── 編輯 Modal target ──
// 表單 state / 驗證 / API 呼叫都在 OrganismEditQuestionModal 裡，這邊只保留 target
const editTarget = ref<QuestionItem | null>(null);

// ── 管理分類 Modal ──
// 實際 CRUD 在 OrganismCategoriesManagerModal 裡跑，這裡只負責開關 + reload categories
const categoriesManagerOpen = ref(false);

const openCategoriesManager = () => {
  categoriesManagerOpen.value = true;
};

const reloadCategories = async () => {
  try {
    categories.value = await adminApi.getCategories();
  } catch {
    /* 靜默失敗，下次開 Modal 會再試 */
  }
};

// ── Helpers ──

const statusLabel = (status: string) => {
  const map: Record<string, string> = { PENDING: '待審核', PUBLISHED: '已上架', REJECTED: '未通過' };
  return map[status] || status;
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
};

// ── API ──

const fetchQuestions = async () => {
  loading.value = true;
  try {
    const params = new URLSearchParams();
    if (filters.status) params.set('status', String(filters.status));
    if (filters.categoryId) params.set('categoryId', String(filters.categoryId));
    if (filters.keyword) params.set('keyword', filters.keyword);
    if (filters.optionKeyword) params.set('optionKeyword', filters.optionKeyword);
    if (filters.author) params.set('author', filters.author);
    if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.set('dateTo', filters.dateTo);
    params.set('page', String(currentPage.value - 1));
    params.set('size', String(PAGE_SIZE));
    if (activeTab.value === 'stats' || activeTab.value === 'options') params.set('includeStats', 'true');

    const data = await adminApi.listQuestions(params.toString());
    questions.value = data.content;
    totalElements.value = data.totalElements;
  } catch {
    alert('載入失敗');
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  currentPage.value = 1;
  fetchQuestions();
};

const handleClear = () => {
  filters.status = 'PENDING';
  filters.categoryId = '';
  filters.keyword = '';
  filters.optionKeyword = '';
  filters.author = '';
  filters.dateFrom = '';
  filters.dateTo = '';
  currentPage.value = 1;
  fetchQuestions();
};

const onPageChange = (page: number) => {
  currentPage.value = page;
  fetchQuestions();
};

// ── 核准 ──
// 開啟 Modal 只需要把 target 傳進 Organism，它會在 watch 裡重置 form
const openPublishModal = (q: QuestionItem) => {
  publishTarget.value = q;
};

// ── 退回 ──

const handleReject = async (id: number) => {
  if (!confirm('確定這題不通過嗎？')) return;
  try {
    await adminApi.reject(id);
    fetchQuestions();
  } catch {
    alert('操作失敗');
  }
};

// ── 編輯 ──
// 開 Modal 只需要把 target 傳進 Organism，它會在 watch 裡把資料倒進 form
const openEditModal = (q: QuestionItem) => {
  editTarget.value = q;
};

// ── 刪除 ──

const handleDelete = async (id: number) => {
  if (!confirm('確定要刪除這題嗎？此操作無法復原。')) return;
  try {
    await adminApi.remove(id);
    fetchQuestions();
  } catch {
    alert('刪除失敗');
  }
};

// ── 初始載入 ──

onMounted(async () => {
  await Promise.all([
    fetchQuestions(),
    adminApi.getCategories().then(d => (categories.value = d)),
    adminApi.getBibleBooks().then(d => (bibleBooks.value = d)),
  ]);
});
</script>

<style lang="scss" scoped>
.aq {
  // ── 加寬容器 ──
  &__wide-container {
    max-width: 72rem;
  }

  // ── Tab 切換 ──
  // ── 空狀態 ──
  &__empty {
    text-align: center;
    padding: 3rem;
    color: $text-dim;
    font-size: 1rem;
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
    font-size: 1rem;
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
    font-size: 1rem;
    color: $text-dim;
  }

  &__content {
    color: $text-bright;
    font-size: 1rem;
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
    font-size: 1rem;
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

  // ── 分類 + 經文 ──
  &__ref-info {
    display: flex;
    gap: 0.75rem;
    font-size: 1rem;
    color: $text-muted;
    margin-bottom: 0.75rem;
  }

  // ── 統計用 ──
  &__accuracy {
    &--high {
      color: $success;
      font-weight: 600;
    }

    &--mid {
      color: #fbbf24;
      font-weight: 600;
    }

    &--low {
      color: $danger-light;
      font-weight: 600;
    }
  }

  &__no-data {
    color: $text-dim;
  }

  &__correct-yes {
    color: $success;
    font-weight: 700;
  }

  &__correct-no {
    color: $text-dim;
  }

  // ── 操作按鈕 ──
  &__actions {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  // ── Modal 共用 ──
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
