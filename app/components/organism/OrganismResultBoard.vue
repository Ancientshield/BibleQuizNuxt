<template>
  <div class="result-board">
    <!-- 玻璃擬態主卡片 -->
    <div class="result-board__card">
      <!-- 分數圓環 -->
      <div class="result-board__ring">
        <svg
          class="result-board__ring-svg"
          viewBox="0 0 120 120"
        >
          <defs>
            <linearGradient
              id="ring-gradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="0%"
            >
              <stop
                offset="0%"
                stop-color="#06b6d4"
              />
              <stop
                offset="50%"
                stop-color="#3b82f6"
              />
              <stop
                offset="100%"
                stop-color="#a855f7"
              />
            </linearGradient>
          </defs>

          <!-- 底環 -->
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="rgba(30,41,59,0.8)"
            stroke-width="8"
          />
          <!-- 進度環 -->
          <circle
            cx="60"
            cy="60"
            r="52"
            fill="none"
            stroke="url(#ring-gradient)"
            stroke-width="8"
            stroke-linecap="round"
            :stroke-dasharray="ringCircumference"
            :stroke-dashoffset="ringOffset"
            class="result-board__ring-progress"
          />
        </svg>

        <!-- 光帶：CSS mask 裁切到進度弧，conic-gradient + blur 產生發光效果 -->
        <div
          class="result-board__ring-shine"
          :style="{
            '--progress-deg': `${progressDeg}deg`,
            maskImage: ringMaskSvg,
            WebkitMaskImage: ringMaskSvg,
            visibility: shineVisible ? 'visible' : 'hidden',
          }"
        >
          <div
            class="result-board__ring-shine-beam"
            :style="{ transform: `rotate(${shineRotation}deg)`, transition: shineTransition }"
          />
        </div>

        <!-- 分數文字 -->
        <div class="result-board__ring-text">
          <span class="result-board__ring-score">{{ score }}</span>
          <span class="result-board__ring-divider">/{{ total }}</span>
        </div>
      </div>

      <!-- XP 取得 -->
      <div class="result-board__xp">+{{ score * 100 }} XP</div>

      <!-- 標語 -->
      <h1 class="result-board__tagline">{{ tagline }}</h1>

      <!-- 再玩一次按鈕 -->
      <button
        class="result-board__restart"
        @click="emit('restart')"
      >
        <span class="result-board__restart-text">
          再玩一次
          <Icon
            name="lucide:refresh-cw"
            class="result-board__restart-arrow"
          />
        </span>
      </button>
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

const ringCircumference = 2 * Math.PI * 52;
const ringOffset = computed(() => ringCircumference * (1 - props.score / props.total));

// CSS mask：用 SVG data URI 產生跟進度環一模一樣的弧形遮罩
const ringMaskSvg = computed(() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="white" stroke-width="8" stroke-linecap="round" transform="rotate(-90 60 60)" stroke-dasharray="${ringCircumference}" stroke-dashoffset="${ringOffset.value}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
});

// 光帶動畫：conic-gradient 旋轉掃過 + CSS mask 裁切 + visibility 停頓
const progressDeg = computed(() => (props.score / props.total) * 360);

const shineRotation = ref(0);
const shineVisible = ref(false);
const shineTransition = ref('none');
let shineTimer: ReturnType<typeof setTimeout>;

function runShine() {
  shineTransition.value = 'none';
  shineRotation.value = 0;
  shineVisible.value = true;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      // 旋轉角度 = 弧段角度，光帶亮心從弧頭掃到弧尾
      shineTransition.value = 'transform 1s ease-in-out';
      shineRotation.value = progressDeg.value;

      // transition 結束後隱藏，2 秒後再跑
      shineTimer = setTimeout(() => {
        shineVisible.value = false;
        shineTimer = setTimeout(runShine, 2000);
      }, 1000);
    });
  });
}

onMounted(() => {
  runShine();
});

onUnmounted(() => {
  clearTimeout(shineTimer);
});

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

  // 卡片外圍光暈
  &::before {
    content: '';
    position: absolute;
    width: 100%;
    max-width: 28rem;
    height: 100%;
    max-height: 28rem;
    border-radius: 1.5rem;
    background: linear-gradient(to right, rgba(168, 85, 247, 0.3), rgba(34, 211, 238, 0.3), rgba(168, 85, 247, 0.3));
    filter: blur(24px);
    animation: pulse-slow 3s ease-in-out infinite;
  }

  &__card {
    position: relative;
    width: 100%;
    max-width: 28rem;
    border-radius: 1.5rem;
    background: rgba(15, 23, 42, 0.5);
    backdrop-filter: blur(16px);
    border: 1px solid rgba(51, 65, 85, 0.5);
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

  &__ring {
    position: relative;
    width: 9rem;
    height: 9rem;
    border-radius: 50%;
    // 用 box-shadow 做光暈，不會跟 backdrop-filter 衝突產生方塊
    box-shadow:
      0 0 20px rgba(59, 130, 246, 0.3),
      0 0 40px rgba(6, 182, 212, 0.2);
    animation: ring-glow 3s ease-in-out infinite;

    @media (min-width: 768px) {
      width: 11rem;
      height: 11rem;
    }
  }

  &__ring-svg {
    position: relative;
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  &__ring-progress {
    transition: stroke-dashoffset 1.2s ease-out;
  }

  &__ring-shine {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    mask-size: 100% 100%;
    -webkit-mask-size: 100% 100%;
    mask-repeat: no-repeat;
    -webkit-mask-repeat: no-repeat;
  }

  &__ring-shine-beam {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    // 光帶寬度 = 40% 弧長，柔邊漸層 + blur 產生發光效果
    background: conic-gradient(
      transparent 0deg,
      rgba(255, 255, 255, 0.12) calc(var(--progress-deg) * 0.1),
      rgba(255, 255, 255, 0.4) calc(var(--progress-deg) * 0.2),
      rgba(255, 255, 255, 0.12) calc(var(--progress-deg) * 0.3),
      transparent calc(var(--progress-deg) * 0.4),
      transparent 360deg
    );
    filter: blur(3px);
  }

  &__ring-text {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  &__ring-score {
    font-size: 2.75rem;
    font-weight: 900;
    color: #fff;
    line-height: 1;

    @media (min-width: 768px) {
      font-size: 3.5rem;
    }
  }

  &__ring-divider {
    font-size: 1.25rem;
    font-weight: 600;
    color: #94a3b8;
    margin-top: 0.75rem;

    @media (min-width: 768px) {
      font-size: 1.5rem;
      margin-top: 1rem;
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
    color: #e2e8f0;
    text-align: center;
    line-height: 1.6;

    @media (min-width: 768px) {
      font-size: 1.5rem;
    }
  }

  &__restart {
    position: relative;
    width: 100%;
    max-width: 20rem;
    overflow: hidden;
    border-radius: 1rem;
    padding: 0.875rem;
    font-weight: 700;
    font-size: 1.125rem;
    color: white;
    border: none;
    cursor: pointer;
    transition: all 0.3s;
    margin-top: 0.5rem;
    background: linear-gradient(to right, #06b6d4, #a855f7, #ec4899);

    @media (min-width: 768px) {
      padding: 1rem;
      font-size: 1.25rem;
    }

    &:hover {
      transform: scale(1.02);
    }

    &:active {
      transform: scale(0.98);
    }

    // hover 光暈
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      opacity: 0;
      transition: opacity 0.3s;
      background: linear-gradient(to right, #22d3ee, #a855f7, #ec4899);
      filter: blur(16px);
    }

    &:hover::before {
      opacity: 1;
    }

    // 掃光
    &::after {
      content: '';
      position: absolute;
      inset: 0;
      width: 50%;
      background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
      transform: skewX(12deg) translateX(-200%);
    }

    &:hover::after {
      animation: button-shine 0.6s ease-out;
    }
  }

  &__restart-text {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  &__restart-arrow {
    width: 1.25rem;
    height: 1.25rem;
    transition: transform 0.3s;

    .result-board__restart:hover & {
      transform: rotate(360deg);
    }
  }
}

@keyframes pulse-slow {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

@keyframes ring-glow {
  0%,
  100% {
    box-shadow:
      0 0 20px rgba(59, 130, 246, 0.3),
      0 0 40px rgba(6, 182, 212, 0.2);
  }
  50% {
    box-shadow:
      0 0 30px rgba(59, 130, 246, 0.5),
      0 0 60px rgba(6, 182, 212, 0.35);
  }
}

@keyframes button-shine {
  0% {
    transform: skewX(12deg) translateX(-200%);
  }
  100% {
    transform: skewX(12deg) translateX(400%);
  }
}
</style>
