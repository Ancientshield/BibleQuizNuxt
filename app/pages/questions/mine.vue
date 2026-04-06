<template>
  <main class="main">
    <div class="main__container">
      <div class="main__header">
        <h1 class="main__title">
          <Icon
            name="lucide:file-text"
            class="main__title-icon"
          />
          我的題目
        </h1>
        <button
          class="main__action-btn"
          @click="navigateTo('/questions/new')"
        >
          <Icon
            name="lucide:plus"
            class="main__action-icon"
          />
          投稿新題目
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
        class="mine__empty"
      >
        <Icon
          name="lucide:inbox"
          class="mine__empty-icon"
        />
        <p>還沒有投稿過題目</p>
        <button
          class="mine__empty-btn"
          @click="navigateTo('/questions/new')"
        >
          投稿第一題
        </button>
      </div>

      <!-- 題目列表 -->
      <div
        v-else
        class="mine__list"
      >
        <div
          v-for="q in questions"
          :key="q.id"
          class="mine__card"
        >
          <div class="mine__card-top">
            <span :class="['mine__status', `mine__status--${q.status.toLowerCase()}`]">
              {{ statusLabel(q.status) }}
            </span>
            <span class="mine__date">{{ formatDate(q.createdAt) }}</span>
          </div>

          <p class="mine__content">{{ q.content }}</p>

          <div class="mine__card-bottom">
            <span class="mine__option-count">{{ q.options.length }} 個選項</span>
            <div
              v-if="q.status === 'PENDING'"
              class="mine__actions"
            >
              <button
                class="mine__edit-btn"
                @click="navigateTo(`/questions/${q.id}`)"
              >
                <Icon name="lucide:pencil" />
                編輯
              </button>
              <button
                class="mine__delete-btn"
                @click="handleDelete(q.id)"
              >
                <Icon name="lucide:trash-2" />
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

interface QuestionItem {
  id: number;
  content: string;
  status: string;
  options: { id: number }[];
  createdAt: string;
}

const loading = ref(true);
const questions = ref<QuestionItem[]>([]);

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    PENDING: '待審核',
    PUBLISHED: '已上架',
    REJECTED: '被退回',
  };
  return map[status] || status;
};

const formatDate = (iso: string) => {
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
};

const fetchQuestions = async () => {
  loading.value = true;
  try {
    questions.value = await useAuthFetch<QuestionItem[]>('/api/questions/mine');
  } catch {
    alert('載入失敗');
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (id: number) => {
  if (!confirm('確定要刪除這題嗎？')) return;
  try {
    await useAuthFetch(`/api/questions/${id}`, { method: 'DELETE' });
    questions.value = questions.value.filter(q => q.id !== id);
  } catch (err: unknown) {
    const fetchErr = err as { data?: { message?: string } };
    alert(fetchErr.data?.message || '刪除失敗');
  }
};

onMounted(fetchQuestions);
</script>

<style lang="scss" scoped>
.mine {
  // ── 空狀態 ──
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 3rem 1rem;
    color: $text-dim;
    text-align: center;
  }

  &__empty-icon {
    width: 3rem;
    height: 3rem;
    color: #475569;
  }

  &__empty-btn {
    padding: 0.5rem 1.25rem;
    border-radius: 0.625rem;
    background: linear-gradient(to right, $gradient-start, $gradient-end);
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    border: none;
    cursor: pointer;
    transition: opacity 0.2s;

    &:hover {
      opacity: 0.9;
    }
  }

  // ── 題目列表 ──
  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__card {
    padding: 1rem 1.25rem;
    border-radius: 0.75rem;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba($border-base, 0.5);
    transition: border-color 0.2s;

    &:hover {
      border-color: rgba(71, 85, 105, 0.7);
    }
  }

  &__card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  // ── 狀態標籤 ──
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

  &__date {
    font-size: 0.75rem;
    color: $text-dim;
  }

  &__content {
    color: $text-bright;
    font-size: 0.9375rem;
    line-height: 1.5;
    margin-bottom: 0.75rem;
  }

  &__card-bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__option-count {
    font-size: 0.75rem;
    color: $text-dim;
  }

  &__actions {
    display: flex;
    gap: 0.5rem;
  }

  &__edit-btn,
  &__delete-btn {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    padding: 0.25rem 0.625rem;
    border-radius: 0.375rem;
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;
    border: none;
    transition: all 0.2s;

    svg {
      width: 0.75rem;
      height: 0.75rem;
    }
  }

  &__edit-btn {
    background: rgba($accent, 0.1);
    color: $accent;

    &:hover {
      background: rgba($accent, 0.2);
    }
  }

  &__delete-btn {
    background: rgba($danger, 0.1);
    color: $danger-light;

    &:hover {
      background: rgba($danger, 0.2);
    }
  }
}
</style>
