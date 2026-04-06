<template>
  <main class="main">
    <div class="main__container">
      <h1 class="main__title">
        <Icon
          name="lucide:bar-chart-3"
          class="main__title-icon"
        />
        題目統計
      </h1>

      <!-- Loading -->
      <div
        v-if="loading"
        class="main__loading"
      >
        載入中...
      </div>

      <!-- 空狀態 -->
      <div
        v-else-if="questionStats.length === 0"
        class="stats__empty"
      >
        還沒有作答紀錄
      </div>

      <!-- 題目統計列表 -->
      <div
        v-else
        class="stats__list"
      >
        <div
          v-for="q in questionStats"
          :key="q.questionId"
          class="stats__card"
          @click="openDetail(q.questionId)"
        >
          <div class="stats__card-top">
            <span class="stats__qid">#{{ q.questionId }}</span>
            <span
              class="stats__accuracy"
              :class="accuracyClass(q.accuracyRate)"
            >
              {{ q.accuracyRate }}%
            </span>
          </div>
          <p class="stats__content">{{ q.content }}</p>
          <div class="stats__card-bottom">
            <span>被答 {{ q.totalAnswered }} 次</span>
            <span>答對 {{ q.correctCount }} 次</span>
          </div>
        </div>
      </div>

      <!-- 單題詳情 Modal -->
      <Teleport to="body">
        <Transition name="modal">
          <div
            v-if="detail"
            class="stats__modal-overlay"
            @click.self="detail = null"
          >
            <div class="stats__modal">
              <h2 class="stats__modal-title">選項分佈</h2>
              <p class="stats__modal-question">{{ detail.content }}</p>

              <div class="stats__distribution">
                <div
                  v-for="opt in detail.optionDistribution"
                  :key="opt.optionId"
                  class="stats__dist-row"
                >
                  <span :class="['stats__dist-label', { 'stats__dist-label--correct': opt.correct }]">
                    {{ opt.content }}
                  </span>
                  <div class="stats__dist-bar-wrapper">
                    <div
                      class="stats__dist-bar"
                      :class="{ 'stats__dist-bar--correct': opt.correct }"
                      :style="{ width: barWidth(opt.selectedCount) }"
                    />
                  </div>
                  <span class="stats__dist-count">{{ opt.selectedCount }}</span>
                </div>
              </div>

              <div
                v-if="detail.mostSelectedWrongOption"
                class="stats__wrong-hint"
              >
                最常選錯：{{ detail.mostSelectedWrongOption }}
              </div>

              <button
                class="stats__modal-close"
                @click="detail = null"
              >
                關閉
              </button>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] });

interface QuestionStats {
  questionId: number;
  content: string;
  totalAnswered: number;
  correctCount: number;
  accuracyRate: number;
  optionDistribution?: OptionStats[];
  mostSelectedWrongOption?: string;
}

interface OptionStats {
  optionId: number;
  content: string;
  correct: boolean;
  selectedCount: number;
}

const loading = ref(true);
const questionStats = ref<QuestionStats[]>([]);
const detail = ref<QuestionStats | null>(null);

const accuracyClass = (rate: number) => {
  if (rate >= 70) return 'stats__accuracy--high';
  if (rate >= 40) return 'stats__accuracy--mid';
  return 'stats__accuracy--low';
};

const barWidth = (count: number) => {
  if (!detail.value) return '0%';
  const max = Math.max(...(detail.value.optionDistribution?.map(o => o.selectedCount) || [1]));
  return max > 0 ? `${(count / max) * 100}%` : '0%';
};

const openDetail = async (questionId: number) => {
  try {
    detail.value = await useAuthFetch<QuestionStats>(`/api/admin/stats/questions/${questionId}`);
  } catch {
    alert('載入失敗');
  }
};

onMounted(async () => {
  try {
    questionStats.value = await useAuthFetch<QuestionStats[]>('/api/admin/stats/questions');
  } catch {
    alert('載入失敗');
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.stats {
  &__empty {
    text-align: center;
    padding: 3rem;
    color: $text-dim;
  }

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
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      border-color: rgba($accent, 0.3);
    }
  }

  &__card-top {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.375rem;
  }

  &__qid {
    font-size: 0.75rem;
    color: $text-dim;
  }

  &__accuracy {
    font-size: 0.875rem;
    font-weight: 700;

    &--high {
      color: $success;
    }

    &--mid {
      color: #fbbf24;
    }

    &--low {
      color: $danger-light;
    }
  }

  &__content {
    color: $text-bright;
    font-size: 0.9375rem;
    line-height: 1.4;
    margin-bottom: 0.5rem;
  }

  &__card-bottom {
    display: flex;
    gap: 1rem;
    font-size: 0.75rem;
    color: $text-dim;
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
    max-width: 32rem;
    border-radius: 1rem;
    background: rgba($bg-dark, 0.95);
    backdrop-filter: blur(24px);
    border: 1px solid rgba($border-base, 0.5);
    padding: 1.5rem;
    box-shadow: 0 0 40px rgba(0, 0, 0, 0.5);
  }

  &__modal-title {
    font-size: 1.125rem;
    font-weight: 700;
    color: $text-bright;
    margin-bottom: 0.5rem;
  }

  &__modal-question {
    font-size: 0.875rem;
    color: $text-muted;
    margin-bottom: 1.25rem;
    line-height: 1.4;
  }

  // ── 選項分佈圖 ──
  &__distribution {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  &__dist-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__dist-label {
    width: 8rem;
    font-size: 0.8125rem;
    color: $text-muted;
    flex-shrink: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    &--correct {
      color: $success-light;
    }
  }

  &__dist-bar-wrapper {
    flex: 1;
    height: 0.5rem;
    border-radius: 9999px;
    background: rgba(30, 41, 59, 0.8);
    overflow: hidden;
  }

  &__dist-bar {
    height: 100%;
    border-radius: 9999px;
    background: $text-dim;
    transition: width 0.5s ease;

    &--correct {
      background: $success;
    }
  }

  &__dist-count {
    width: 2rem;
    text-align: right;
    font-size: 0.75rem;
    color: $text-muted;
    flex-shrink: 0;
  }

  &__wrong-hint {
    font-size: 0.8125rem;
    color: $danger-light;
    margin-bottom: 1rem;
  }

  &__modal-close {
    width: 100%;
    padding: 0.625rem;
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
}

.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}

.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
