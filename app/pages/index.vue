<template>
  <main class="home-page">
    <!-- 動態漸層背景（與 start.vue 相同色系） -->
    <div class="home-page__bg home-page__bg--gradient" />
    <div class="home-page__bg home-page__bg--radial" />

    <!-- 浮動粒子 -->
    <div class="home-page__particles">
      <div
        v-for="i in 20"
        :key="i"
        class="home-page__particle"
        :style="getParticleStyle(i)"
      />
    </div>

    <!-- 主內容區（垂直水平置中） -->
    <div class="home-page__content">
      <div class="home-page__card-wrapper">
        <!-- 卡片外圍光暈 -->
        <div class="home-page__card-glow" />

        <!-- 玻璃擬態主卡片 -->
        <div class="home-page__card">
          <!-- 書本 Icon -->
          <div class="home-page__icon-wrapper">
            <div class="home-page__icon-glow" />
            <div class="home-page__icon">
              <Icon
                name="lucide:book-open"
                class="home-page__icon-svg"
              />
            </div>
          </div>

          <!-- 標題 -->
          <h1 class="home-page__title">Bible Quiz</h1>
          <p class="home-page__subtitle">測試你的聖經知識</p>

          <!-- 統計預覽 -->
          <div class="home-page__stats">
            <div class="home-page__stat">
              <div class="home-page__stat-value home-page__stat-value--cyan">
                {{ totalQuestions }}
              </div>
              <div class="home-page__stat-label">題目</div>
            </div>
            <div class="home-page__stat">
              <div class="home-page__stat-value home-page__stat-value--amber">100</div>
              <div class="home-page__stat-label">XP / 題</div>
            </div>
          </div>

          <!-- 開始按鈕 -->
          <div class="home-page__start-btn-wrapper">
            <div class="home-page__start-btn-glow" />
            <button
              class="home-page__start-btn"
              @click="startGame"
            >
              <div class="home-page__start-btn-bg" />
              <div class="home-page__start-btn-shine">
                <div class="home-page__start-btn-shine-ray" />
              </div>
              <span class="home-page__start-btn-text">
                <Icon
                  name="lucide:sparkles"
                  class="home-page__start-btn-sparkle"
                />
                開始挑戰
                <Icon
                  name="lucide:sparkles"
                  class="home-page__start-btn-sparkle"
                />
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- 底部提示文字 -->
      <p class="home-page__footer-text">準備好了嗎？點擊開始測試你的聖經知識！</p>
    </div>
  </main>
</template>

<script setup lang="ts">
const totalQuestions = 10;

const getParticleStyle = (i: number) => {
  // 用固定種子避免 SSR/CSR hydration mismatch
  const seed = i * 2654435761;
  const pseudo = (s: number) => ((s * 16807) % 2147483647) / 2147483647;
  return {
    left: `${pseudo(seed) * 100}%`,
    top: `${pseudo(seed + 1) * 100}%`,
    animationDelay: `${pseudo(seed + 2) * 5}s`,
    animationDuration: `${pseudo(seed + 3) * 10 + 10}s`,
  };
};

const startGame = () => {
  navigateTo('/start', { replace: true });
};
</script>

<style lang="scss" scoped>
.home-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  background: #020617; // slate-950

  // ── 背景層（與 start.vue 共用同色系） ──
  &__bg {
    position: absolute;
    inset: 0;

    &--gradient {
      background: linear-gradient(to bottom right, #581c87, #0f172a, #1e3a5f);
      background-size: 200% 200%;
      animation: gradient-shift 15s ease infinite;
    }

    &--radial {
      background: radial-gradient(ellipse at top, rgba(107, 33, 168, 0.2), transparent, transparent);
    }
  }

  // ── 浮動粒子 ──
  &__particles {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  &__particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba(34, 211, 238, 0.3); // cyan-400/30
    border-radius: 50%;
    animation: float 8s ease-in-out infinite;
  }

  // ── 主內容區 ──
  &__content {
    position: relative;
    z-index: 10;
    display: flex;
    min-height: 100vh;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem 1rem 1.5rem; // 上方預留 Navbar 高度
  }

  // ── 卡片容器 ──
  &__card-wrapper {
    position: relative;
    width: 100%;
    max-width: 32rem; // max-w-lg
  }

  &__card-glow {
    position: absolute;
    inset: -4px;
    border-radius: 1.5rem;
    background: linear-gradient(to right, rgba(168, 85, 247, 0.3), rgba(34, 211, 238, 0.3), rgba(168, 85, 247, 0.3));
    filter: blur(16px);
    animation: pulse-slow 3s ease-in-out infinite;
  }

  &__card {
    position: relative;
    border-radius: 1.5rem;
    background: rgba(15, 23, 42, 0.5); // slate-900/50
    backdrop-filter: blur(24px);
    border: 1px solid rgba(51, 65, 85, 0.5); // slate-700/50
    padding: 2rem;
    box-shadow: 0 0 60px rgba(139, 92, 246, 0.2);

    @media (min-width: 768px) {
      padding: 3rem;
    }
  }

  // ── 書本 Icon ──
  &__icon-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 1.5rem;
    position: relative;
  }

  &__icon-glow {
    position: absolute;
    inset: -12px;
    width: calc(5rem + 24px);
    height: calc(5rem + 24px);
    margin: auto;
    border-radius: 50%;
    background: rgba(6, 182, 212, 0.2); // cyan-500/20
    filter: blur(16px);
    animation: pulse 2s ease-in-out infinite;

    @media (min-width: 768px) {
      width: calc(6rem + 24px);
      height: calc(6rem + 24px);
    }
  }

  &__icon {
    position: relative;
    width: 5rem;
    height: 5rem;
    border-radius: 1rem;
    background: linear-gradient(to bottom right, #06b6d4, #9333ea); // cyan-500 → purple-600
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 30px rgba(34, 211, 238, 0.4);

    @media (min-width: 768px) {
      width: 6rem;
      height: 6rem;
      border-radius: 1.25rem;
    }
  }

  &__icon-svg {
    width: 2.5rem;
    height: 2.5rem;
    color: white;

    @media (min-width: 768px) {
      width: 3rem;
      height: 3rem;
    }
  }

  // ── 標題 ──
  &__title {
    font-size: 2.25rem;
    font-weight: 900;
    text-align: center;
    margin-bottom: 1rem;
    background: linear-gradient(to right, #22d3ee, #a855f7, #22d3ee); // cyan-400 → purple-400 → cyan-400
    background-size: 200% 200%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradient-text 3s ease infinite;
    filter: drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07));

    @media (min-width: 768px) {
      font-size: 3rem;
    }

    @media (min-width: 1024px) {
      font-size: 3.75rem;
    }
  }

  &__subtitle {
    color: #94a3b8; // slate-400
    text-align: center;
    font-size: 1.125rem;
    margin-bottom: 2rem;
  }

  // ── 統計預覽 ──
  &__stats {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  &__stat {
    border-radius: 0.75rem;
    background: rgba(30, 41, 59, 0.6); // slate-800/60
    backdrop-filter: blur(4px);
    border: 1px solid rgba(51, 65, 85, 0.5);
    padding: 1rem;
    text-align: center;
  }

  &__stat-value {
    font-size: 1.5rem;
    font-weight: 700;

    @media (min-width: 768px) {
      font-size: 1.875rem;
    }

    &--cyan {
      color: #22d3ee;
      filter: drop-shadow(0 0 10px rgba(34, 211, 238, 0.5));
    }

    &--amber {
      color: #fbbf24;
      filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.5));
    }
  }

  &__stat-label {
    font-size: 0.875rem;
    color: #94a3b8;
    margin-top: 0.25rem;
  }

  // ── 開始按鈕 ──
  &__start-btn {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: 1rem;
    padding: 1rem;
    font-weight: 700;
    font-size: 1.25rem;
    color: white;
    border: none;
    cursor: pointer;
    transition: all 0.3s;

    @media (min-width: 768px) {
      padding: 1.25rem;
      font-size: 1.5rem;
    }

    &:hover {
      transform: scale(1.02);
    }

    &:active {
      transform: scale(0.98);
    }
  }

  &__start-btn-wrapper {
    position: relative;
    width: 100%;
  }

  &__start-btn-glow {
    position: absolute;
    inset: -4px;
    border-radius: 1rem;
    background: linear-gradient(to right, #06b6d4, #a855f7);
    filter: blur(12px);
    opacity: 0.4;
    transition: opacity 0.3s;
    z-index: 0;

    .home-page__start-btn-wrapper:hover & {
      opacity: 0.6;
    }
  }

  &__start-btn-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, #06b6d4, #a855f7, #06b6d4); // cyan-500 → purple-500 → cyan-500
    background-size: 200% 200%;
    animation: gradient-shift 15s ease infinite;
  }

  &__start-btn-shine {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  &__start-btn-shine-ray {
    position: absolute;
    inset: 0;
    width: 50%;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
    transform: skewX(12deg) translateX(-200%);

    .home-page__start-btn:hover & {
      animation: button-shine 0.6s ease-out;
    }
  }

  &__start-btn-text {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }

  &__start-btn-sparkle {
    width: 1.5rem;
    height: 1.5rem;
    animation: pulse-slow 3s ease-in-out infinite;

    @media (min-width: 768px) {
      width: 1.75rem;
      height: 1.75rem;
    }
  }

  // ── 底部提示文字 ──
  &__footer-text {
    margin-top: 2rem;
    font-size: 0.875rem;
    color: #64748b; // slate-500
    text-align: center;
  }
}

// ── Keyframes ──
@keyframes gradient-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) translateX(0);
    opacity: 0.3;
  }
  25% {
    transform: translateY(-20px) translateX(10px);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-40px) translateX(-10px);
    opacity: 0.3;
  }
  75% {
    transform: translateY(-20px) translateX(5px);
    opacity: 0.6;
  }
}

@keyframes gradient-text {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
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

@keyframes button-shine {
  0% {
    transform: skewX(12deg) translateX(-200%);
  }
  100% {
    transform: skewX(12deg) translateX(400%);
  }
}
</style>
