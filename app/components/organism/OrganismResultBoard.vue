<!--
  OrganismResultBoard — 答題結算畫面。

  顯示內容：分數圓環、XP 取得、根據分數動態的標語、再玩一次按鈕。
  標語用 taglines 字典，每個分數對應一句鼓勵 / 調侃的話。

  為什麼不用 OrganismGlassCard：
  GlassCard 是「全頁 layout」（自帶背景、置中），但結算畫面嵌在 start.vue 的 content 區域裡，
  外層 layout 已經由 start.vue 處理，這裡只需要嵌入式卡片樣式。
-->
<template>
  <div class="result-board">
    <!-- 玻璃擬態主卡片 -->
    <div class="result-board__card">
      <!-- 分數圓環 -->
      <MoleculeScoreRing
        :score="score"
        :total="total"
      />

      <!-- XP 取得（每題 100 經驗值） -->
      <div class="result-board__xp">+{{ score * 100 }} XP</div>

      <!-- 根據分數顯示的標語 -->
      <h1 class="result-board__tagline">{{ tagline }}</h1>

      <!-- 再玩一次按鈕（用 pink variant 視覺更搶眼） -->
      <MoleculeGradientButton
        variant="pink"
        class="result-board__restart"
        @click="emit('restart')"
      >
        再玩一次
        <Icon
          name="lucide:refresh-cw"
          class="result-board__restart-icon"
        />
      </MoleculeGradientButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  score: number;
  total: number;
}>();

const emit = defineEmits<{
  restart: [];
}>();

// 分數對應的標語（0~10 分，每一分都有不同的文字）
const taglines: Record<number, string> = {
  0: '沒關係，聖經挑戰永遠為你敞開！',
  1: '至少答對了一題，繼續加油！',
  2: '有點生疏，多讀聖經吧！',
  3: '再努力一點就能及格了！',
  4: '快到一半了，別放棄！',
  5: '剛好一半，不上不下的成績呢',
  6: '及格了！基本功還不錯',
  7: '很不錯，看來有在讀聖經！',
  8: '厲害！你對聖經相當熟悉',
  9: '差一題就滿分，太可惜了！',
  10: '滿分！你真是聖經達人！',
};
const tagline = computed(() => taglines[props.score] ?? '測驗結束！');
</script>

<style lang="scss" scoped>
.result-board {
  position: relative;
  display: flex;
  flex: 1;
  align-items: center;
  justify-content: center;

  // 卡片外圍呼吸光暈（紫藍漸層 + blur）
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    max-width: 28rem;
    height: 100%;
    max-height: 28rem;
    border-radius: 1.5rem;
    background: linear-gradient(to right, rgba(168, 85, 247, 0.3), rgba($accent, 0.3), rgba(168, 85, 247, 0.3));
    filter: blur(24px);
    animation: pulse-slow 3s ease-in-out infinite;
  }

  &__card {
    position: relative;
    width: 100%;
    max-width: 28rem;
    border-radius: 1.5rem;
    background: rgba($bg-dark, 0.5);
    backdrop-filter: blur(16px);
    border: 1px solid rgba($border-base, 0.5);
    padding: 2.5rem 2rem;
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1.5rem;

    @media (min-width: 768px) {
      padding: 3rem;
    }
  }

  &__xp {
    font-size: 1.5rem;
    font-weight: 700;
    color: #fbbf24;
    filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.5));

    @media (min-width: 768px) {
      font-size: 1.75rem;
    }
  }

  &__tagline {
    font-size: 1.25rem;
    font-weight: 600;
    color: $text-bright;
    text-align: center;
    line-height: 1.6;

    @media (min-width: 768px) {
      font-size: 1.5rem;
    }
  }

  // 再玩一次按鈕容器（class 會套到 MoleculeGradientButton 根元素 .grad-btn__wrapper 上）
  &__restart {
    max-width: 20rem;
    margin-top: 0.5rem;
  }

  // icon 本身（正常樣式）
  &__restart-icon {
    width: 1.25rem;
    height: 1.25rem;
    transition: transform 0.3s;
  }

  // hover 按鈕時 icon 旋轉 360°
  // 因為 .result-board__restart 套在 wrapper 上，hover 任何子元素都會觸發
  &__restart:hover &__restart-icon {
    transform: rotate(360deg);
  }
}
</style>
