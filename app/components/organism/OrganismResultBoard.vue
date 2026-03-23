<template>
  <div class="result-board">
    <h1 class="result-board__title">測驗結束！</h1>
    <p class="result-board__score">
      你答對了
      <span class="result-board__score-value">{{ score }}</span>
      /
      {{ total }}
      題
    </p>
    <button
      class="result-board__restart"
      @click="emit('restart')"
    >
      再玩一次
    </button>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  score: number; // 答對題數
  total: number; // 總題數
}>();

// 簡易版結算，Phase B-6-6 做完整版含每題明細
interface Emits {
  restart: []; // 點擊「再玩一次」→ quiz.vue 重新 fetchQuestions()
}

const emit = defineEmits<Emits>();
</script>

<style lang="scss" scoped>
.result-board {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 2rem;

  &__title {
    font-size: 3rem;
    font-weight: 700;
    color: #fff;
    filter: drop-shadow(0 4px 6px rgba(0, 0, 0, 0.3));
  }

  &__score {
    font-size: 1.875rem;
    color: #67e8f9; // cyan-300
  }

  &__score-value {
    color: #fbbf24; // amber-400
  }

  &__restart {
    margin-top: 1rem;
    border-radius: 1rem;
    border: 2px solid #22d3ee; // cyan-400
    background: rgba(15, 23, 42, 0.6); // slate-900/60
    padding: 1rem 3rem;
    font-size: 1.25rem;
    font-weight: 700;
    color: #fff;
    backdrop-filter: blur(12px);
    transition: all 0.3s;
    cursor: pointer;

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 0 30px rgba(34, 211, 238, 0.4);
    }
  }
}
</style>
