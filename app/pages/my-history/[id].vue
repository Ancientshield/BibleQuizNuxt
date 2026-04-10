<template>
  <main class="main">
    <div class="main__container">
      <h1 class="main__title">
        <Icon
          name="lucide:clipboard-list"
          class="main__title-icon"
        />
        答題回顧
      </h1>

      <!-- 總覽 -->
      <div
        v-if="detail"
        class="review__summary"
      >
        <span class="review__score">{{ detail.score }}/{{ detail.totalQuestions }}</span>
        <span class="review__date">{{ formatDate(detail.completedAt) }}</span>
      </div>

      <!-- Loading -->
      <div
        v-if="loading"
        class="main__loading"
      >
        載入中...
      </div>

      <!-- 逐題結果 -->
      <div
        v-else-if="detail"
        class="review__list"
      >
        <div
          v-for="(a, i) in detail.answers"
          :key="a.questionId"
          :class="['review__card', a.correct ? 'review__card--correct' : 'review__card--wrong']"
        >
          <!-- 題號 + 對錯 -->
          <div class="review__card-top">
            <span class="review__qnum">第 {{ i + 1 }} 題</span>
            <span :class="a.correct ? 'review__badge--correct' : 'review__badge--wrong'">
              {{ a.correct ? '答對' : '答錯' }}
            </span>
          </div>

          <!-- 題目 -->
          <p class="review__question">{{ a.questionContent }}</p>

          <!-- 選項列表 -->
          <div class="review__options">
            <div
              v-for="opt in a.options"
              :key="opt.id"
              :class="[
                'review__option',
                {
                  'review__option--selected': opt.id === a.selectedOptionId,
                  'review__option--correct-answer': opt.correct,
                  'review__option--wrong-selected': opt.id === a.selectedOptionId && !a.correct,
                },
              ]"
            >
              <span class="review__option-text">{{ opt.content }}</span>
              <Icon
                v-if="opt.correct"
                name="lucide:check"
                class="review__option-icon review__option-icon--correct"
              />
              <Icon
                v-else-if="opt.id === a.selectedOptionId && !a.correct"
                name="lucide:x"
                class="review__option-icon review__option-icon--wrong"
              />
            </div>
          </div>

          <!-- 經文出處（答錯才顯示） -->
          <p
            v-if="!a.correct && a.bibleRef"
            class="review__ref"
          >
            <Icon name="lucide:book-open" />
            {{ a.bibleRef }}
          </p>
        </div>
      </div>

      <!-- 返回 -->
      <button
        class="review__back"
        @click="navigateTo('/my-history')"
      >
        <Icon name="lucide:arrow-left" />
        返回我的紀錄
      </button>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

interface OptionItem {
  id: number;
  content: string;
  correct: boolean;
}

interface AnswerDetail {
  questionId: number;
  questionContent: string;
  bibleRef: string | null;
  options: OptionItem[];
  selectedOptionId: number;
  correct: boolean;
}

interface RoundDetail {
  roundId: number;
  score: number;
  totalQuestions: number;
  completedAt: string;
  answers: AnswerDetail[];
}

const route = useRoute();
const loading = ref(true);
const detail = ref<RoundDetail | null>(null);

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${d.getFullYear()}/${mm}/${dd} ${hh}:${mi}`;
};

onMounted(async () => {
  try {
    detail.value = await useAuthFetch<RoundDetail>(`/api/user/history/${route.params.id}`);
  } catch {
    navigateTo('/my-history', { replace: true });
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.review {
  // ── 總覽 ──
  &__summary {
    display: flex;
    align-items: baseline;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  &__score {
    font-size: 2rem;
    font-weight: 800;
    color: $accent;
  }

  &__date {
    font-size: 1rem;
    color: $text-dim;
  }

  // ── 題目列表 ──
  &__list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  &__card {
    padding: 1.25rem;
    border-radius: 0.75rem;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba($border-base, 0.5);

    &--correct {
      border-left: 3px solid $success;
    }

    &--wrong {
      border-left: 3px solid $danger;
    }
  }

  &__card-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.5rem;
  }

  &__qnum {
    font-size: 1rem;
    color: $text-dim;
    font-weight: 500;
  }

  &__badge--correct {
    font-size: 1rem;
    font-weight: 600;
    color: $success;
  }

  &__badge--wrong {
    font-size: 1rem;
    font-weight: 600;
    color: $danger-light;
  }

  &__question {
    font-size: 1rem;
    color: $text-bright;
    line-height: 1.5;
    margin-bottom: 0.75rem;
  }

  // ── 選項 ──
  &__options {
    display: flex;
    flex-direction: column;
    gap: 0.375rem;
  }

  &__option {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    background: rgba(30, 41, 59, 0.4);
    border: 1px solid transparent;
    color: $text-muted;
    font-size: 1rem;

    &--correct-answer {
      border-color: rgba($success, 0.3);
      color: $success-light;
      background: rgba($success, 0.06);
    }

    &--wrong-selected {
      border-color: rgba($danger, 0.3);
      color: $danger-light;
      background: rgba($danger, 0.06);
    }
  }

  &__option-icon {
    width: 1rem;
    height: 1rem;
    flex-shrink: 0;

    &--correct {
      color: $success;
    }

    &--wrong {
      color: $danger-light;
    }
  }

  // ── 經文出處 ──
  &__ref {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.75rem;
    padding: 0.5rem 0.75rem;
    border-radius: 0.5rem;
    background: rgba(251, 191, 36, 0.08);
    border: 1px solid rgba(251, 191, 36, 0.2);
    color: #fbbf24;
    font-size: 1rem;

    svg {
      width: 1rem;
      height: 1rem;
      flex-shrink: 0;
    }
  }

  // ── 返回按鈕 ──
  &__back {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border-radius: 0.625rem;
    background: transparent;
    border: 1px solid rgba($border-base, 0.5);
    color: $text-muted;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;

    svg {
      width: 1rem;
      height: 1rem;
    }

    &:hover {
      color: $accent;
      border-color: rgba($accent, 0.3);
    }
  }
}
</style>
