<!--
  MoleculeScoreRing — 分數圓環（SVG 進度環 + 光帶掃描動畫）。

  顯示「得分/總分」的圓形進度，含三個視覺層：
  1. 底環（暗色）
  2. 進度環（cyan → blue → purple 漸層，依 score/total 畫弧）
  3. 光帶掃描（conic-gradient + CSS mask 裁切到進度弧範圍，循環掃描）

  光帶動畫是複雜的部分：
  - 用 SVG data URI 當 CSS mask，讓光帶只顯示在進度弧內
  - conic-gradient 內部的透明→亮→透明漸層模擬「光點」形狀
  - 透過 rotate 旋轉 conic-gradient 讓光點沿弧移動
  - 掃完後 visibility 隱藏 2 秒再重複，形成週期性掃光效果
-->
<template>
  <div class="score-ring">
    <svg
      class="score-ring__svg"
      viewBox="0 0 120 120"
    >
      <defs>
        <linearGradient
          id="score-ring-gradient"
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
        stroke="url(#score-ring-gradient)"
        stroke-width="8"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="ringOffset"
        class="score-ring__progress"
      />
    </svg>

    <!-- 光帶掃描層 -->
    <div
      class="score-ring__shine"
      :style="{
        '--progress-deg': `${progressDeg}deg`,
        maskImage: maskSvg,
        WebkitMaskImage: maskSvg,
        visibility: shineVisible ? 'visible' : 'hidden',
      }"
    >
      <div
        class="score-ring__shine-beam"
        :style="{ transform: `rotate(${shineRotation}deg)`, transition: shineTransition }"
      />
    </div>

    <!-- 中心分數文字 -->
    <div class="score-ring__text">
      <span class="score-ring__score">{{ score }}</span>
      <span class="score-ring__divider">/{{ total }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{
  score: number;
  total: number;
}>();

// 圓周長 = 2πr，r=52（固定）
const circumference = 2 * Math.PI * 52;

// 進度環的 stroke-dashoffset：從滿長度倒扣掉答對比例，畫出對應弧長
const ringOffset = computed(() => circumference * (1 - props.score / props.total));

// 進度弧對應的角度（0~360）
const progressDeg = computed(() => (props.score / props.total) * 360);

/**
 * CSS mask：動態產生跟進度環一模一樣的 SVG，當作 mask image。
 * 把 conic-gradient 光帶裁切到只顯示在進度弧範圍內，
 * 避免光帶跑出未完成的弧段。
 */
const maskSvg = computed(() => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120"><circle cx="60" cy="60" r="52" fill="none" stroke="white" stroke-width="8" stroke-linecap="round" transform="rotate(-90 60 60)" stroke-dasharray="${circumference}" stroke-dashoffset="${ringOffset.value}"/></svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
});

// ── 光帶動畫狀態 ──
const shineRotation = ref(0);
const shineVisible = ref(false);
const shineTransition = ref('none');
let shineTimer: ReturnType<typeof setTimeout>;

/**
 * 光帶掃描循環：
 * 1. 重置旋轉角度 + 顯示光帶（transition: none，避免從上次角度插值回 0）
 * 2. 兩個 RAF 後打開 transition，旋轉到進度角度（光點從弧頭掃到弧尾）
 * 3. 掃完後隱藏光帶，等 2 秒再重複
 */
function runShine() {
  shineTransition.value = 'none';
  shineRotation.value = 0;
  shineVisible.value = true;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      shineTransition.value = 'transform 1s ease-in-out';
      shineRotation.value = progressDeg.value;

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
</script>

<style lang="scss" scoped>
.score-ring {
  position: relative;
  width: 9rem;
  height: 9rem;
  border-radius: 50%;
  // 用 box-shadow 做光暈，避免跟 backdrop-filter 衝突產生方塊
  box-shadow:
    0 0 20px rgba(59, 130, 246, 0.3),
    0 0 40px rgba($gradient-start, 0.2);
  animation: ring-glow 3s ease-in-out infinite;

  @media (min-width: 768px) {
    width: 11rem;
    height: 11rem;
  }

  &__svg {
    position: relative;
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }

  &__progress {
    transition: stroke-dashoffset 1.2s ease-out;
  }

  &__shine {
    position: absolute;
    inset: 0;
    pointer-events: none;
    overflow: hidden;
    mask-size: 100% 100%;
    -webkit-mask-size: 100% 100%;
    mask-repeat: no-repeat;
    -webkit-mask-repeat: no-repeat;
  }

  &__shine-beam {
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

  &__text {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: none;
  }

  &__score {
    font-size: 2.75rem;
    font-weight: 900;
    color: #fff;
    line-height: 1;

    @media (min-width: 768px) {
      font-size: 3.5rem;
    }
  }

  &__divider {
    font-size: 1.25rem;
    font-weight: 600;
    color: $text-muted;
    margin-top: 0.75rem;

    @media (min-width: 768px) {
      font-size: 1.5rem;
      margin-top: 1rem;
    }
  }
}

// 圓環外圍的呼吸光暈
@keyframes ring-glow {
  0%,
  100% {
    box-shadow:
      0 0 20px rgba(59, 130, 246, 0.3),
      0 0 40px rgba($gradient-start, 0.2);
  }
  50% {
    box-shadow:
      0 0 30px rgba(59, 130, 246, 0.5),
      0 0 60px rgba($gradient-start, 0.35);
  }
}
</style>
