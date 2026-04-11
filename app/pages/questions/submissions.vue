<template>
  <main class="main">
    <div class="main__container">
      <div class="main__header">
        <h1 class="main__title">
          <Icon
            name="lucide:file-text"
            class="main__title-icon"
          />
          我要投稿
        </h1>
        <AtomButton
          variant="primary"
          size="button-l"
          @click="navigateTo('/questions/create')"
        >
          <Icon name="lucide:plus" />
          投稿新題目
        </AtomButton>
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
        <AtomButton
          variant="primary"
          size="button-l"
          @click="navigateTo('/questions/create')"
        >
          投稿第一題
        </AtomButton>
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
              v-if="q.status === 'PENDING' || q.status === 'REJECTED'"
              class="mine__actions"
            >
              <AtomButton
                variant="primary"
                appearance="outline-view"
                size="button-s"
                @click="navigateTo(`/questions/${q.id}`)"
              >
                <Icon name="lucide:pencil" />
                編輯
              </AtomButton>
              <AtomButton
                variant="danger"
                appearance="outline-view"
                size="button-s"
                @click="handleDelete(q.id)"
              >
                <Icon name="lucide:trash-2" />
                刪除
              </AtomButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { QuestionItem } from '~/composables/useQuestionApi';

definePageMeta({ middleware: 'auth' });

const { listMine, remove } = useQuestionApi();
const loading = ref(true);
const questions = ref<QuestionItem[]>([]);

const statusLabel = (status: string) => {
  const map: Record<string, string> = {
    PENDING: '待審核',
    PUBLISHED: '已上架',
    REJECTED: '未通過',
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
    questions.value = await listMine();
  } catch {
    alert('載入失敗');
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (id: number) => {
  if (!confirm('確定要刪除這題嗎？')) return;
  try {
    await remove(id);
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
}
</style>
