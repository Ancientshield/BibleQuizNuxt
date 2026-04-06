<template>
  <main class="main">
    <div class="main__container">
      <h1 class="main__title">
        <Icon
          name="lucide:shield"
          class="main__title-icon"
        />
        管理後台
      </h1>

      <!-- 統計卡片 -->
      <div
        v-if="stats"
        class="admin-home__stats"
      >
        <div class="admin-home__stat-card">
          <div class="admin-home__stat-value admin-home__stat-value--cyan">
            {{ stats.totalRounds }}
          </div>
          <div class="admin-home__stat-label">總遊戲次數</div>
        </div>
        <div class="admin-home__stat-card">
          <div class="admin-home__stat-value admin-home__stat-value--purple">
            {{ stats.totalPublishedQuestions }}
          </div>
          <div class="admin-home__stat-label">上架題目數</div>
        </div>
        <div class="admin-home__stat-card">
          <div class="admin-home__stat-value admin-home__stat-value--amber">{{ stats.averageAccuracyRate }}%</div>
          <div class="admin-home__stat-label">平均答對率</div>
        </div>
      </div>

      <!-- 功能入口 -->
      <div class="admin-home__links">
        <button
          class="admin-home__link-card"
          @click="navigateTo('/admin/questions')"
        >
          <Icon
            name="lucide:list-checks"
            class="admin-home__link-icon"
          />
          <div>
            <div class="admin-home__link-title">題目審核</div>
            <div class="admin-home__link-desc">查看、核准或退回投稿題目</div>
          </div>
        </button>
        <button
          class="admin-home__link-card"
          @click="navigateTo('/admin/stats')"
        >
          <Icon
            name="lucide:bar-chart-3"
            class="admin-home__link-icon"
          />
          <div>
            <div class="admin-home__link-title">題目統計</div>
            <div class="admin-home__link-desc">答對率、選項分佈、難度分析</div>
          </div>
        </button>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
definePageMeta({ middleware: ['auth', 'admin'] });

interface OverviewStats {
  totalRounds: number;
  totalPublishedQuestions: number;
  averageAccuracyRate: number;
}

const stats = ref<OverviewStats | null>(null);

onMounted(async () => {
  try {
    stats.value = await useAuthFetch<OverviewStats>('/api/admin/stats/overview');
  } catch {
    // 統計載入失敗不阻擋頁面
  }
});
</script>

<style lang="scss" scoped>
.admin-home {
  // ── 統計卡片 ──
  &__stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 0.75rem;
    margin-bottom: 2rem;

    @media (max-width: 640px) {
      grid-template-columns: 1fr;
    }
  }

  &__stat-card {
    padding: 1.25rem;
    border-radius: 0.75rem;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba($border-base, 0.5);
    text-align: center;
  }

  &__stat-value {
    font-size: 1.75rem;
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
    margin-top: 0.25rem;
  }

  // ── 功能入口 ──
  &__links {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__link-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.25rem;
    border-radius: 0.75rem;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba($border-base, 0.5);
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    width: 100%;

    &:hover {
      border-color: rgba($accent, 0.3);
      background: rgba(30, 41, 59, 0.7);
      transform: translateX(4px);
    }
  }

  &__link-icon {
    width: 2rem;
    height: 2rem;
    color: $accent;
    flex-shrink: 0;
  }

  &__link-title {
    color: $text-bright;
    font-weight: 600;
    font-size: 1rem;
    margin-bottom: 0.125rem;
  }

  &__link-desc {
    color: $text-dim;
    font-size: 0.8125rem;
  }
}
</style>
