<template>
  <button
    :disabled="disabled"
    :class="stateClass"
    class="option-btn"
    @click="handleClick"
  >
    <!-- Ripple 水波紋：從點擊位置擴散的圓形半透明動畫 -->
    <span
      v-if="ripple"
      class="option-btn__ripple"
      :style="{
        left: ripple.x + 'px',
        top: ripple.y + 'px',
      }"
    />

    <div class="option-btn__content">
      <!-- 左側：徽章 + 文字 -->
      <div class="option-btn__left">
        <AtomOptionBadge
          :label="label"
          :state="state"
        />
        <span>{{ text }}</span>
      </div>

      <!-- 右側：答題結果圖示（僅作答後顯示） -->
      <AtomResultIcon
        v-if="state === 'correct'"
        type="correct"
      />
      <AtomResultIcon
        v-else-if="state === 'wrong'"
        type="wrong"
      />
    </div>
  </button>
</template>

<script setup lang="ts">
// 匯出型別，供 quiz.vue 等外部元件使用
export type OptionState = 'default' | 'correct' | 'wrong' | 'disabled';

const props = defineProps<{
  label: string; // 選項代號："A" | "B" | "C" | "D"
  text: string; // 選項文字內容
  state: OptionState; // 視覺狀態，由父層根據答題結果決定
  disabled: boolean; // 答題後鎖定，防止重複點擊
}>();

interface Emits {
  select: [label: string, event: MouseEvent]; // 點擊事件，傳回選項代號
}

const emit = defineEmits<Emits>();

// 動態 BEM modifier class：option-btn--default / --correct / --wrong / --disabled
const stateClass = computed(() => `option-btn--${props.state}`);

// Ripple 水波紋座標（null 表示不顯示）
const ripple = ref<{ x: number; y: number } | null>(null);

// 點擊 → 算座標觸發 ripple → 600ms 清除 → emit 給父層
const handleClick = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement;
  const rect = target.getBoundingClientRect();
  ripple.value = {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  };

  setTimeout(() => {
    ripple.value = null;
  }, 600);

  emit('select', props.label, e);
};
</script>

<style lang="scss" scoped>
.option-btn {
  position: relative;
  overflow: hidden;
  border-radius: 0.75rem;
  padding: 1rem;
  font-weight: 600;
  font-size: 1.125rem;
  text-align: left;
  transition: all 0.3s ease-out;
  border: 2px solid;
  cursor: pointer;

  @media (min-width: 768px) {
    border-radius: 1rem;
    padding: 1.5rem;
    font-size: 1.25rem;
  }

  &:disabled {
    cursor: not-allowed;
  }

  // ── States ──
  &--default {
    background: rgba(30, 41, 59, 0.6); // slate-800/60
    backdrop-filter: blur(12px);
    border-color: rgba(71, 85, 105, 0.5); // slate-600/50
    color: #fff;

    &:hover:not(:disabled) {
      transform: scale(1.02);
      border-color: rgba(34, 211, 238, 0.7); // cyan-400/70
      box-shadow: 0 0 25px rgba(34, 211, 238, 0.3);
    }
  }

  &--correct {
    background: rgba(6, 78, 59, 0.6); // emerald-900/60
    border-color: #34d399; // emerald-400
    color: #d1fae5; // emerald-100
    box-shadow: 0 0 30px rgba(52, 211, 153, 0.4);
    animation: pulse-glow-green 1s ease-in-out infinite; // 答對呼吸光暈
  }

  &--wrong {
    background: rgba(127, 29, 29, 0.6); // red-900/60
    border-color: #f87171; // red-400
    color: #fee2e2; // red-100
    box-shadow: 0 0 30px rgba(248, 113, 113, 0.4);
    animation: shake 0.5s ease-in-out; // 答錯左右搖晃
  }

  &--disabled {
    background: rgba(30, 41, 59, 0.3); // slate-800/30
    border-color: rgba(51, 65, 85, 0.3); // slate-700/30
    color: rgb(100, 116, 139); // slate-500
  }

  // ── Inner elements ──
  &__content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 1rem;
  }

  &__left {
    display: flex;
    align-items: center;
    gap: 0.75rem;

    @media (min-width: 768px) {
      gap: 1rem;
    }
  }

  &__ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(34, 211, 238, 0.3); // cyan-400/30
    width: 10px;
    height: 10px;
    transform: translate(-50%, -50%) scale(1);
    pointer-events: none;
    will-change: transform, opacity;
    animation: ripple 0.6s ease-out forwards;
  }
}

// 用 transform: scale() 取代 width/height 動畫，避免觸發 layout
@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 1;
  }
  100% {
    transform: translate(-50%, -50%) scale(50);
    opacity: 0;
  }
}

@keyframes shake {
  0%,
  100% {
    transform: translateX(0);
  }
  20%,
  60% {
    transform: translateX(-8px);
  }
  40%,
  80% {
    transform: translateX(8px);
  }
}

@keyframes pulse-glow-green {
  0%,
  100% {
    box-shadow: 0 0 30px rgba(52, 211, 153, 0.4);
  }
  50% {
    box-shadow: 0 0 50px rgba(52, 211, 153, 0.6);
  }
}
</style>
