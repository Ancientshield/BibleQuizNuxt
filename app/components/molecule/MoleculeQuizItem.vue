<!--
  MoleculeQuizItem — 答題頁的道具按鈕（刪去法 / 經文提示 / 觀眾投票）。

  三個道具用同一個元件，靠 color prop 切換色系：
  - red：刪去法（代表消除、警示）
  - amber：經文提示（金黃代表聖經、提示）
  - cyan：觀眾投票（青藍代表資料、統計）

  外部同時控制 `used`（整局不可再按）和 `disabled`（答題中不可按）：
  兩個狀態分開是為了讓 `used` 能觸發灰化 + 刪除線的視覺，而 `disabled`
  只是臨時鎖定，不需要特殊視覺。

  `burst` 是一次性觸發旗標，start.vue 在 handleUseItem 設 true 並在 600ms 後設回 false，
  這段時間元件會播放 item-burst 爆發動畫。
-->
<template>
  <button
    class="quiz-item"
    :class="[`quiz-item--${color}`, { 'quiz-item--used': used, 'quiz-item--burst': burst }]"
    :disabled="used || disabled"
    @click="$emit('use')"
  >
    <span class="quiz-item__glow" />
    <Icon :name="icon" />
    <span class="quiz-item__label">{{ label }}</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  label: string;
  color: 'red' | 'amber' | 'cyan';
  used?: boolean;
  burst?: boolean;
  disabled?: boolean;
}>();

defineEmits<{
  use: [];
}>();
</script>

<style lang="scss" scoped>
.quiz-item {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.25rem;
  padding: 0.75rem 1.25rem;
  border-radius: 1rem;
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(12px);
  border: 1.5px solid;
  cursor: pointer;
  transition: all 0.25s ease;
  overflow: hidden;

  svg {
    width: 1.5rem;
    height: 1.5rem;
    filter: drop-shadow(0 0 4px currentColor);
    transition: all 0.25s;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);

    svg {
      transform: scale(1.15);
      filter: drop-shadow(0 0 8px currentColor);
    }
  }

  &:active:not(:disabled) {
    transform: scale(0.92);
  }

  // ── 呼吸光暈底層 ──
  &__glow {
    position: absolute;
    inset: -1px;
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.3s;
    pointer-events: none;
  }

  &:not(:disabled) &__glow {
    opacity: 1;
    animation: item-breathe 2.5s ease-in-out infinite;
  }

  // ── 道具名稱 ──
  &__label {
    font-size: 1rem;
    font-weight: 600;
    letter-spacing: 0.02em;
  }

  // ── 色系：red（刪去法） ──
  &--red {
    border-color: rgba(#f43f5e, 0.4);
    color: #fb7185;

    .quiz-item__glow {
      background: radial-gradient(ellipse at center, rgba(#f43f5e, 0.15), transparent 70%);
    }

    &:hover:not(:disabled) {
      border-color: rgba(#f43f5e, 0.6);
      box-shadow:
        0 0 20px rgba(#f43f5e, 0.2),
        inset 0 0 12px rgba(#f43f5e, 0.06);
    }
  }

  // ── 色系：amber（經文提示） ──
  &--amber {
    border-color: rgba(#fbbf24, 0.4);
    color: #fbbf24;

    .quiz-item__glow {
      background: radial-gradient(ellipse at center, rgba(#fbbf24, 0.12), transparent 70%);
    }

    &:hover:not(:disabled) {
      border-color: rgba(#fbbf24, 0.6);
      box-shadow:
        0 0 20px rgba(#fbbf24, 0.2),
        inset 0 0 12px rgba(#fbbf24, 0.06);
    }
  }

  // ── 色系：cyan（觀眾投票） ──
  &--cyan {
    border-color: rgba(#22d3ee, 0.4);
    color: #22d3ee;

    .quiz-item__glow {
      background: radial-gradient(ellipse at center, rgba(#22d3ee, 0.15), transparent 70%);
    }

    &:hover:not(:disabled) {
      border-color: rgba(#22d3ee, 0.6);
      box-shadow:
        0 0 20px rgba(#22d3ee, 0.2),
        inset 0 0 12px rgba(#22d3ee, 0.06);
    }
  }

  // ── 使用瞬間爆發動畫 ──
  &--burst {
    animation: item-burst 0.6s ease-out;
  }

  // ── 已使用：灰化 + 刪除線 ──
  &--used {
    border-color: rgba($border-base, 0.2) !important;
    color: rgba($text-muted, 0.3) !important;
    background: rgba(15, 23, 42, 0.4);
    box-shadow: none !important;

    svg {
      filter: none;
    }

    .quiz-item__label {
      text-decoration: line-through;
    }
  }

  &:disabled {
    cursor: not-allowed;
  }
}

// ── 局部 keyframes（只給道具用） ──
@keyframes item-breathe {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 1;
  }
}

@keyframes item-burst {
  0% {
    transform: scale(1);
    filter: brightness(1);
  }
  30% {
    transform: scale(1.15);
    filter: brightness(1.6);
  }
  100% {
    transform: scale(1);
    filter: brightness(1);
  }
}
</style>
