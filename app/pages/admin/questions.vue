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
      <div class="aq__tabs">
        <button
          :class="['aq__tab', { 'aq__tab--active': activeTab === 'manage' }]"
          @click="switchTab('manage')"
        >
          <Icon name="lucide:list" />
          題目管理
        </button>
        <button
          :class="['aq__tab', { 'aq__tab--active': activeTab === 'stats' }]"
          @click="switchTab('stats')"
        >
          <Icon name="lucide:bar-chart-3" />
          題目統計
        </button>
        <button
          :class="['aq__tab', { 'aq__tab--active': activeTab === 'options' }]"
          @click="switchTab('options')"
        >
          <Icon name="lucide:list" />
          選項統計
        </button>
      </div>

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

              <div class="aq__modal-row">
                <div class="aq__modal-field">
                  <label class="aq__modal-label">章</label>
                  <select
                    v-model.number="publishForm.bibleChapter"
                    class="aq__modal-select"
                    :disabled="!publishForm.bibleBookId"
                  >
                    <option
                      :value="null"
                      disabled
                    >
                      選擇章
                    </option>
                    <option
                      v-for="ch in chapterOptions(publishForm.bibleBookId)"
                      :key="ch"
                      :value="ch"
                    >
                      {{ ch }}
                    </option>
                  </select>
                </div>
                <div class="aq__modal-field">
                  <label class="aq__modal-label">起始節</label>
                  <select
                    v-model.number="publishForm.bibleVerseStart"
                    class="aq__modal-select"
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
                <div class="aq__modal-field">
                  <label class="aq__modal-label">結束節</label>
                  <select
                    v-model.number="publishForm.bibleVerseEnd"
                    class="aq__modal-select"
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

              <div class="aq__modal-actions">
                <AtomButton
                  appearance="outline-view"
                  @click="publishTarget = null"
                >
                  取消
                </AtomButton>
                <AtomButton
                  :disabled="publishLoading"
                  @click="handlePublish"
                >
                  {{ publishLoading ? '處理中...' : '確認核准' }}
                </AtomButton>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- ══ 編輯 Modal ══ -->
      <Teleport to="body">
        <Transition name="modal">
          <div
            v-if="editTarget"
            class="aq__modal-overlay"
            @click.self="editTarget = null"
          >
            <div class="aq__modal aq__modal--wide">
              <h2 class="aq__modal-title">編輯題目 #{{ editTarget.id }}</h2>

              <!-- 題目內容 -->
              <div class="aq__modal-field">
                <label class="aq__modal-label">題目內容</label>
                <textarea
                  v-model="editForm.content"
                  class="aq__modal-textarea"
                  rows="3"
                />
              </div>

              <!-- 選項 -->
              <div class="aq__modal-field">
                <label class="aq__modal-label">選項（選一個正確答案）</label>
                <div class="aq__edit-options">
                  <div
                    v-for="(opt, i) in editForm.options"
                    :key="i"
                    class="aq__edit-option"
                  >
                    <label class="aq__edit-radio-wrapper">
                      <input
                        type="radio"
                        name="edit-correct"
                        :value="i"
                        :checked="editCorrectIndex === i"
                        class="aq__edit-radio"
                        @change="editCorrectIndex = i"
                      />
                      <span class="aq__edit-radio-dot" />
                    </label>
                    <input
                      v-model="opt.content"
                      class="aq__modal-input"
                      :placeholder="`選項 ${String.fromCharCode(65 + i)}`"
                    />
                  </div>
                </div>
              </div>

              <!-- 分類 -->
              <div class="aq__modal-field">
                <label class="aq__modal-label">分類</label>
                <select
                  v-model="editForm.categoryId"
                  class="aq__modal-select"
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

              <!-- 書卷 + 章節 -->
              <div class="aq__modal-field">
                <label class="aq__modal-label">書卷</label>
                <select
                  v-model="editForm.bibleBookId"
                  class="aq__modal-select"
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

              <div class="aq__modal-row">
                <div class="aq__modal-field">
                  <label class="aq__modal-label">章</label>
                  <select
                    v-model.number="editForm.bibleChapter"
                    class="aq__modal-select"
                    :disabled="!editForm.bibleBookId"
                  >
                    <option
                      :value="null"
                      disabled
                    >
                      選擇章
                    </option>
                    <option
                      v-for="ch in chapterOptions(editForm.bibleBookId)"
                      :key="ch"
                      :value="ch"
                    >
                      {{ ch }}
                    </option>
                  </select>
                </div>
                <div class="aq__modal-field">
                  <label class="aq__modal-label">起始節</label>
                  <select
                    v-model.number="editForm.bibleVerseStart"
                    class="aq__modal-select"
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
                <div class="aq__modal-field">
                  <label class="aq__modal-label">結束節</label>
                  <select
                    v-model.number="editForm.bibleVerseEnd"
                    class="aq__modal-select"
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

              <div class="aq__modal-actions">
                <AtomButton
                  appearance="outline-view"
                  @click="editTarget = null"
                >
                  取消
                </AtomButton>
                <AtomButton
                  :disabled="editLoading"
                  @click="handleEdit"
                >
                  {{ editLoading ? '處理中...' : '儲存' }}
                </AtomButton>
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

const PAGE_SIZE = 10;

// ── 型別 ──

interface QuestionItem {
  id: number;
  content: string;
  status: string;
  categoryId: number | null;
  categoryName: string | null;
  bibleBookId: number | null;
  bibleRef: string | null;
  bibleChapter: number | null;
  bibleVerseStart: number | null;
  bibleVerseEnd: number | null;
  options: { id: number; content: string; correct: boolean; selectedCount?: number }[];
  totalAnswered: number | null;
  correctCount: number | null;
  accuracyRate: number | null;
  mostSelectedWrongOption: string | null;
  authorName: string | null;
  createdAt: string;
}

interface PageResponse {
  content: QuestionItem[];
  totalElements: number;
  totalPages: number;
}

interface Category {
  id: number;
  name: string;
}

interface BibleBook {
  id: number;
  name: string;
}

// ── 書卷章數（和合本，ID = sortOrder 1~66） ──
const BOOK_CHAPTERS: Record<number, number> = {
  1: 50,
  2: 40,
  3: 27,
  4: 36,
  5: 34,
  6: 24,
  7: 21,
  8: 4,
  9: 31,
  10: 24,
  11: 22,
  12: 25,
  13: 29,
  14: 36,
  15: 10,
  16: 13,
  17: 10,
  18: 42,
  19: 150,
  20: 31,
  21: 12,
  22: 8,
  23: 66,
  24: 52,
  25: 5,
  26: 48,
  27: 12,
  28: 14,
  29: 3,
  30: 9,
  31: 1,
  32: 4,
  33: 7,
  34: 3,
  35: 3,
  36: 3,
  37: 2,
  38: 14,
  39: 4,
  40: 28,
  41: 16,
  42: 24,
  43: 21,
  44: 28,
  45: 16,
  46: 16,
  47: 13,
  48: 6,
  49: 6,
  50: 4,
  51: 4,
  52: 5,
  53: 3,
  54: 6,
  55: 4,
  56: 3,
  57: 1,
  58: 13,
  59: 5,
  60: 5,
  61: 3,
  62: 5,
  63: 1,
  64: 1,
  65: 1,
  66: 22,
};

const chapterOptions = (bookId: number | null) => {
  if (!bookId) return [];
  const max = BOOK_CHAPTERS[bookId] || 0;
  return Array.from({ length: max }, (_, i) => i + 1);
};

// 節數：聖經最多 176 節（詩篇 119），統一提供 1~176
const VERSE_OPTIONS = Array.from({ length: 176 }, (_, i) => i + 1);

// ── Tab ──

const activeTab = ref<'manage' | 'stats' | 'options'>('manage');
const sortField = ref<'totalAnswered' | 'accuracyRate' | ''>('');
const sortDir = ref<'asc' | 'desc'>('desc');

const switchTab = (tab: 'manage' | 'stats' | 'options') => {
  if (activeTab.value === tab) return;
  activeTab.value = tab;
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

// ── 核准 Modal ──

const publishTarget = ref<QuestionItem | null>(null);
const publishLoading = ref(false);
const publishForm = reactive({
  categoryId: null as number | null,
  bibleBookId: null as number | null,
  bibleChapter: null as number | null,
  bibleVerseStart: null as number | null,
  bibleVerseEnd: null as number | null,
});

// ── 編輯 Modal ──

const editTarget = ref<QuestionItem | null>(null);
const editLoading = ref(false);
const editCorrectIndex = ref(0);
const editForm = reactive({
  content: '',
  options: [{ content: '' }, { content: '' }, { content: '' }, { content: '' }] as { content: string }[],
  categoryId: null as number | null,
  bibleBookId: null as number | null,
  bibleChapter: null as number | null,
  bibleVerseStart: null as number | null,
  bibleVerseEnd: null as number | null,
});

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

    const data = await useAuthFetch<PageResponse>(`/api/admin/questions?${params.toString()}`);
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

// ── 退回 ──

const handleReject = async (id: number) => {
  if (!confirm('確定這題不通過嗎？')) return;
  try {
    await useAuthFetch(`/api/admin/questions/${id}/reject`, { method: 'PATCH' });
    fetchQuestions();
  } catch {
    alert('操作失敗');
  }
};

// ── 編輯 ──

const openEditModal = (q: QuestionItem) => {
  editTarget.value = q;
  editForm.content = q.content;
  editForm.options = q.options.map(o => ({ content: o.content }));
  // 補齊到 4 個選項
  while (editForm.options.length < 4) editForm.options.push({ content: '' });
  editCorrectIndex.value = q.options.findIndex(o => o.correct);
  editForm.categoryId = q.categoryId;
  editForm.bibleBookId = q.bibleBookId;
  editForm.bibleChapter = q.bibleChapter;
  editForm.bibleVerseStart = q.bibleVerseStart;
  editForm.bibleVerseEnd = q.bibleVerseEnd;
};

const handleEdit = async () => {
  if (!editTarget.value) return;
  if (!editForm.content.trim()) {
    alert('題目內容不能為空');
    return;
  }
  const nonEmpty = editForm.options.filter(o => o.content.trim());
  if (nonEmpty.length < 2) {
    alert('至少需要 2 個選項');
    return;
  }

  // 先把 correct flag 附上再過濾，避免 index 錯位
  const allOptions = editForm.options.map((o, i) => ({
    content: o.content.trim(),
    correct: i === editCorrectIndex.value,
  }));
  const validOptions = allOptions.filter(o => o.content);
  if (!validOptions.some(o => o.correct)) {
    alert('正確答案的選項不能為空');
    return;
  }

  editLoading.value = true;
  try {
    await useAuthFetch(`/api/admin/questions/${editTarget.value.id}`, {
      method: 'PUT',
      body: {
        content: editForm.content.trim(),
        options: validOptions,
        categoryId: editForm.categoryId,
        bibleBookId: editForm.bibleBookId,
        bibleChapter: editForm.bibleChapter,
        bibleVerseStart: editForm.bibleVerseStart,
        bibleVerseEnd: editForm.bibleVerseEnd,
      },
    });
    editTarget.value = null;
    fetchQuestions();
  } catch (err: unknown) {
    const fetchErr = err as { data?: { message?: string } };
    alert(fetchErr.data?.message || '編輯失敗');
  } finally {
    editLoading.value = false;
  }
};

// ── 刪除 ──

const handleDelete = async (id: number) => {
  if (!confirm('確定要刪除這題嗎？此操作無法復原。')) return;
  try {
    await useAuthFetch(`/api/admin/questions/${id}`, { method: 'DELETE' });
    fetchQuestions();
  } catch {
    alert('刪除失敗');
  }
};

// ── 初始載入 ──

onMounted(async () => {
  await Promise.all([
    fetchQuestions(),
    useAuthFetch<Category[]>('/api/admin/questions/categories').then(d => (categories.value = d)),
    useAuthFetch<BibleBook[]>('/api/admin/questions/bible-books').then(d => (bibleBooks.value = d)),
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
  &__tabs {
    display: flex;
    gap: 0.25rem;
    margin-bottom: 1.25rem;
    border-bottom: 1px solid rgba($border-base, 0.5);
  }

  &__tab {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.625rem 1rem;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: $text-muted;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: $text-bright;
    }

    &--active {
      color: $accent;
      border-bottom-color: $accent;
    }

    svg {
      width: 1rem;
      height: 1rem;
    }
  }

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
    max-height: 90vh;
    overflow-y: auto;
    overflow-x: hidden;
    border-radius: 1rem;
    background: rgba($bg-dark, 0.95);
    backdrop-filter: blur(24px);
    border: 1px solid rgba($border-base, 0.5);
    padding: 1.5rem;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);

    &--wide {
      max-width: 36rem;
    }
  }

  &__modal-title {
    font-size: 1rem;
    font-weight: 700;
    color: $text-bright;
    margin-bottom: 0.25rem;
  }

  &__modal-desc {
    font-size: 1rem;
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
    font-size: 1rem;
    color: $text-primary;
    font-weight: 500;
  }

  &__modal-select,
  &__modal-input {
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

    option {
      background: #1e293b;
      color: $text-bright;
    }
  }

  // 自訂 select 箭頭，拉開右邊距離
  &__modal-select {
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
  }

  &__modal-textarea {
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba($border-base, 0.5);
    color: $text-bright;
    font-size: 1rem;
    resize: vertical;
    outline: none;
    transition: all 0.25s;
    font-family: inherit;

    &:focus {
      border-color: rgba($accent, 0.5);
      box-shadow: 0 0 16px rgba($accent, 0.15);
      background: rgba(30, 41, 59, 0.8);
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

  // ── 編輯 Modal 的選項列表 ──
  &__edit-options {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__edit-option {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    .aq__modal-input {
      flex: 1;
      min-width: 0;
    }
  }

  &__edit-radio-wrapper {
    position: relative;
    flex-shrink: 0;
    cursor: pointer;
  }

  &__edit-radio {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;

    &:checked + .aq__edit-radio-dot {
      border-color: $accent;
      background: $accent;
      box-shadow: inset 0 0 0 3px rgba($bg-dark, 0.8);
    }
  }

  &__edit-radio-dot {
    display: block;
    width: 1.25rem;
    height: 1.25rem;
    border-radius: 50%;
    border: 2px solid rgba(71, 85, 105, 0.8);
    background: transparent;
    transition: all 0.2s;
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
