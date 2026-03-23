<template>
  <header class="progress-header">
    <!-- 上排：題號 + 分數 -->
    <div class="progress-header__info">
      <span class="progress-header__question">第 {{ current }} / {{ total }} 題</span>
      <span class="progress-header__score">{{ score * 100 }} XP</span>
    </div>

    <!-- 下排：進度條 -->
    <div class="progress-bar">
      <!-- 填充區塊，寬度 = (current / total) * 100% -->
      <div class="progress-bar__fill" :style="{ width: `${(current / total) * 100}%` }">
        <div class="progress-bar__shine-overlay" />
        <div class="progress-bar__shine">
          <div class="progress-bar__shine-sweep" />
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
defineProps<{
  current: number; // 當前題號（1-based）
  total: number; // 總題數
  score: number; // 答對題數（× 100 顯示為 XP）
}>();
</script>

<style lang="scss" scoped>
.progress-header {
  margin-bottom: 1.5rem;

  @media (min-width: 768px) {
    margin-bottom: 2.5rem;
  }

  &__info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  &__question {
    font-size: 1.125rem;
    font-weight: 700;
    color: #22d3ee; // cyan-400
    letter-spacing: 0.05em;
    filter: drop-shadow(0 0 10px rgba(34, 211, 238, 0.5));

    @media (min-width: 768px) {
      font-size: 1.25rem;
    }
  }

  &__score {
    font-size: 1.125rem;
    font-weight: 700;
    color: #fbbf24; // amber-400
    filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.5));

    @media (min-width: 768px) {
      font-size: 1.25rem;
    }
  }
}

.progress-bar {
  position: relative;
  height: 1rem;
  border-radius: 9999px;
  background: rgba(30, 41, 59, 0.8); // slate-800/80
  border: 1px solid rgb(51, 65, 85); // slate-700
  overflow: hidden;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.3);

  @media (min-width: 768px) {
    height: 1.25rem;
  }

  &__fill {
    position: absolute;
    inset: 0;
    left: 0;
    border-radius: 9999px;
    background: linear-gradient(to right, #06b6d4, #3b82f6, #a855f7); // cyan-500 → blue-500 → purple-500
    transition: all 0.5s ease-out;
    overflow: hidden; // 裁切 shine 層，消除圓角邊緣薄膜
  }

  &__shine-overlay { // 上半白色漸層，模擬立體光澤
    position: absolute;
    inset: 0;
    background: linear-gradient(to bottom, rgba(255, 255, 255, 0.3), transparent);
  }

  &__shine {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  &__shine-sweep { // 左→右掃過的光帶（2s 循環）
    position: absolute;
    inset: 0;
    left: -100%;
    width: 100%;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.4), transparent);
    transform: skewX(12deg);
    animation: shine 2s ease-in-out infinite;
  }
}

@keyframes shine {
  0% {
    transform: translateX(-100%) skewX(12deg);
  }
  100% {
    transform: translateX(300%) skewX(12deg);
  }
}
</style>
