<template>
  <main class="main">
    <div class="main__container">
      <h1 class="main__title">
        <Icon
          name="lucide:history"
          class="main__title-icon"
        />
        我的紀錄
      </h1>

      <!-- 總積分 -->
      <div
        v-if="stats"
        class="history__total-score"
      >
        <div class="history__total-score-row">
          <div class="history__total-score-value">{{ stats.totalScore?.toLocaleString() ?? 0 }}</div>
          <span class="history__total-score-unit">EXP</span>
        </div>
      </div>

      <!-- 個人統計 -->
      <div
        v-if="stats"
        class="history__stats"
      >
        <MoleculeStatCard
          :value="stats.totalGames"
          label="遊戲次數"
          color="cyan"
          size="lg"
        />
        <MoleculeStatCard
          :value="stats.averageScore"
          label="平均分數"
          color="purple"
          size="lg"
        />
        <MoleculeStatCard
          :value="stats.perfectGames"
          label="滿分次數"
          color="amber"
          size="lg"
        />
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
        v-else-if="history.length === 0"
        class="history__empty"
      >
        <Icon
          name="lucide:inbox"
          class="history__empty-icon"
        />
        <p>還沒有遊戲紀錄</p>
        <AtomButton
          variant="primary"
          size="button-l"
          @click="navigateTo('/start')"
        >
          開始挑戰
        </AtomButton>
      </div>

      <!-- 歷史列表 -->
      <div
        v-else
        class="history__list"
      >
        <NuxtLink
          v-for="r in history"
          :key="r.roundId"
          :to="`/my-history/${r.roundId}`"
          class="history__card"
        >
          <div class="history__score">
            <span class="history__score-num">{{ r.score }}</span>
            <span class="history__score-total">/{{ r.totalQuestions }}</span>
          </div>
          <div class="history__info">
            <div class="history__date">{{ formatDate(r.completedAt) }}</div>
            <div class="history__bar-wrapper">
              <div
                class="history__bar"
                :style="{ width: `${(r.score / r.totalQuestions) * 100}%` }"
              />
            </div>
          </div>
        </NuxtLink>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { RoundHistory, UserStats } from '~/composables/useQuizHistoryApi';

definePageMeta({ middleware: 'auth' });

const { listHistory, getStats } = useQuizHistoryApi();
const loading = ref(true);
const history = ref<RoundHistory[]>([]);
const stats = ref<UserStats | null>(null);

const formatDate = (iso: string) => {
  const d = new Date(iso);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${d.getFullYear()}/${mm}/${dd} ${hh}:${mi}`;
};

onMounted(async () => {
  const historyPromise = listHistory()
    .then(d => (history.value = d))
    .catch(() => {});

  const statsPromise = getStats()
    .then(d => (stats.value = d))
    .catch(() => {});

  await Promise.all([historyPromise, statsPromise]);
  loading.value = false;
});
</script>

<style lang="scss" scoped>
.history {
  // ── EXP 區塊 ──
  &__total-score {
    position: relative;
    text-align: center;
    margin-bottom: 1.5rem;
    padding: 2rem;
    border-radius: 1rem;
    background: radial-gradient(ellipse at 50% 0%, rgba(#fbbf24, 0.08) 0%, transparent 60%), rgba(15, 23, 42, 0.6);
    border: 1px solid rgba(#fbbf24, 0.2);

    // 上下金色光條
    &::before,
    &::after {
      content: '';
      position: absolute;
      left: 15%;
      right: 15%;
      height: 2px;
      background: linear-gradient(90deg, transparent, #fbbf24, transparent);
    }

    &::before {
      top: 0;
    }

    &::after {
      bottom: 0;
    }
  }

  &__total-score-row {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 0.5rem;
    // 左邊加一個跟 EXP 等寬的 padding，讓數字視覺置中
    padding-left: 3.5rem;
    background: linear-gradient(135deg, #fde68a, #fbbf24, #d97706);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    filter: drop-shadow(0 0 12px rgba(251, 191, 36, 0.4));
  }

  &__total-score-value {
    font-size: 3rem;
    font-weight: 900;
    letter-spacing: 0.02em;
  }

  &__total-score-unit {
    font-size: 1.5rem;
    font-weight: 800;
    white-space: nowrap;
  }

  // ── 統計卡片 grid ──
  &__stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.5rem;

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }

  // ── 空狀態 ──
  &__empty {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 3rem;
    color: $text-dim;
  }

  &__empty-icon {
    width: 3rem;
    height: 3rem;
    color: #475569;
  }

  // ── 歷史列表 ──
  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  &__card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.875rem 1.25rem;
    border-radius: 0.75rem;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba($border-base, 0.5);
    cursor: pointer;
    transition: all 0.2s;
    // NuxtLink 渲染成 <a>，清掉預設底線與顏色
    text-decoration: none;
    color: inherit;

    &:hover {
      border-color: rgba($accent, 0.3);
      background: rgba(30, 41, 59, 0.7);
    }
  }

  &__score {
    flex-shrink: 0;
    width: 4rem;
    text-align: center;
  }

  &__score-num {
    font-size: 1.25rem;
    font-weight: 800;
    color: $accent;
  }

  &__score-total {
    font-size: 1rem;
    color: $text-dim;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__date {
    font-size: 1rem;
    color: $text-muted;
    margin-bottom: 0.375rem;
  }

  &__bar-wrapper {
    height: 0.375rem;
    border-radius: 9999px;
    background: rgba(30, 41, 59, 0.8);
    overflow: hidden;
  }

  &__bar {
    height: 100%;
    border-radius: 9999px;
    background: linear-gradient(to right, $gradient-start, #a855f7);
    transition: width 0.5s ease;
  }
}
</style>
