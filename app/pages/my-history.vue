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

      <!-- 個人統計 -->
      <div
        v-if="stats"
        class="history__stats"
      >
        <div class="history__stat-card">
          <div class="history__stat-value history__stat-value--cyan">{{ stats.totalGames }}</div>
          <div class="history__stat-label">遊戲次數</div>
        </div>
        <div class="history__stat-card">
          <div class="history__stat-value history__stat-value--purple">{{ stats.averageScore }}</div>
          <div class="history__stat-label">平均分數</div>
        </div>
        <div class="history__stat-card">
          <div class="history__stat-value history__stat-value--amber">{{ stats.bestScore }}</div>
          <div class="history__stat-label">最高分</div>
        </div>
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
        <button
          class="history__empty-btn"
          @click="navigateTo('/start')"
        >
          開始挑戰
        </button>
      </div>

      <!-- 歷史列表 -->
      <div
        v-else
        class="history__list"
      >
        <div
          v-for="r in history"
          :key="r.roundId"
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
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: 'auth' });

interface RoundHistory {
  roundId: number;
  score: number;
  totalQuestions: number;
  completedAt: string;
}

interface UserStats {
  totalGames: number;
  averageScore: number;
  bestScore: number;
}

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
  try {
    const [h, s] = await Promise.all([
      useAuthFetch<RoundHistory[]>('/api/user/history'),
      useAuthFetch<UserStats>('/api/user/stats'),
    ]);
    history.value = h;
    stats.value = s;
  } catch {
    alert('載入失敗');
  } finally {
    loading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.history {
  // ── 統計卡片 ──
  &__stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-bottom: 1.5rem;

    @media (max-width: 480px) {
      grid-template-columns: 1fr;
    }
  }

  &__stat-card {
    padding: 1rem;
    border-radius: 0.75rem;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba($border-base, 0.5);
    text-align: center;
  }

  &__stat-value {
    font-size: 1.5rem;
    font-weight: 800;

    &--cyan {
      color: $accent;
    }

    &--purple {
      color: #a855f7;
    }

    &--amber {
      color: #fbbf24;
    }
  }

  &__stat-label {
    font-size: 0.8125rem;
    color: $text-muted;
    margin-top: 0.125rem;
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

  &__empty-btn {
    padding: 0.5rem 1.25rem;
    border-radius: 0.625rem;
    background: linear-gradient(to right, $gradient-start, $gradient-end);
    color: white;
    font-weight: 600;
    font-size: 0.875rem;
    border: none;
    cursor: pointer;

    &:hover {
      opacity: 0.9;
    }
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
    font-size: 0.875rem;
    color: $text-dim;
  }

  &__info {
    flex: 1;
    min-width: 0;
  }

  &__date {
    font-size: 0.8125rem;
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
