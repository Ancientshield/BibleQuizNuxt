<!--
  OrganismGlassCard — 玻璃擬態全頁卡片。

  用於首頁和 auth 頁面（login / forgot-password / reset-password）。
  結構：全頁漸層背景 + 可選浮動粒子 + 置中玻璃卡片（含 icon + 標題 + 副標題 + 主內容 slot）。

  - size: md（auth 頁面，28rem 寬，icon 4rem）/ lg（首頁，32rem 寬，icon 5rem，字更大）
  - showParticles: 只有首頁 + 登入頁打開，其他 auth 頁面關掉避免太花

  slot 配置：
  - default: 主內容（表單、統計卡、按鈕等）
  - subtitle: 可取代純文字副標題（例如登入頁的「已有帳號？登入」帶超連結）
  - success: 可取代純文字成功訊息（例如 reset-password 成功後的「前往登入」連結）
  - footer: 卡片外底部（條款文字、返回連結）

  為什麼 auth 頁面也用 md 而不是寫死：
  雖然目前只有首頁是 lg，但未來可能有「關於」「排行榜」等頁面也要 lg 尺寸，
  保留 size prop 比未來再加回來容易。
-->
<template>
  <main
    class="glass-card"
    :class="[`glass-card--${size}`]"
  >
    <!-- 動態漸層背景 -->
    <AtomGradientBackground />

    <!-- 浮動粒子 -->
    <div
      v-if="showParticles"
      class="glass-card__particles"
    >
      <div
        v-for="i in 20"
        :key="i"
        class="glass-card__particle"
        :style="getParticleStyle(i)"
      />
    </div>

    <!-- 主內容區 -->
    <div class="glass-card__content">
      <div class="glass-card__center">
        <div class="glass-card__wrapper">
          <!-- 卡片外圍光暈 -->
          <div class="glass-card__glow" />

          <!-- 玻璃擬態主卡片 -->
          <div class="glass-card__body">
            <!-- Icon -->
            <div class="glass-card__icon-wrapper">
              <div class="glass-card__icon-glow" />
              <div class="glass-card__icon">
                <Icon
                  :name="icon"
                  class="glass-card__icon-svg"
                />
              </div>
            </div>

            <!-- 標題 -->
            <h1 class="glass-card__title">{{ title }}</h1>

            <!-- 副標題 slot -->
            <p
              v-if="$slots.subtitle || subtitle"
              class="glass-card__subtitle"
            >
              <slot name="subtitle">{{ subtitle }}</slot>
            </p>

            <!-- 成功訊息 -->
            <Transition name="fade">
              <div
                v-if="successMsg"
                class="glass-card__success"
              >
                <Icon
                  name="lucide:circle-check"
                  class="glass-card__success-icon"
                />
                <slot name="success">{{ successMsg }}</slot>
              </div>
            </Transition>

            <!-- 錯誤訊息 -->
            <Transition name="fade">
              <div
                v-if="errorMsg"
                class="glass-card__error"
              >
                <Icon
                  name="lucide:circle-alert"
                  class="glass-card__error-icon"
                />
                {{ errorMsg }}
              </div>
            </Transition>

            <!-- 主要內容 slot -->
            <slot />
          </div>
        </div>

        <!-- 底部 slot -->
        <slot name="footer" />
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    icon: string;
    title: string;
    subtitle?: string;
    successMsg?: string;
    errorMsg?: string;
    showParticles?: boolean;
    size?: 'md' | 'lg';
  }>(),
  {
    size: 'md',
  }
);

const getParticleStyle = (i: number) => {
  const seed = i * 2654435761;
  const pseudo = (s: number) => ((s * 16807) % 2147483647) / 2147483647;
  return {
    left: `${pseudo(seed) * 100}%`,
    top: `${pseudo(seed + 1) * 100}%`,
    animationDelay: `${pseudo(seed + 2) * 5}s`,
    animationDuration: `${pseudo(seed + 3) * 10 + 10}s`,
  };
};
</script>

<style lang="scss" scoped>
.glass-card {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  background: $bg-page;

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
    background: rgba($accent, 0.3);
    border-radius: 50%;
    animation: float 8s ease-in-out infinite;
  }

  // ── 主內容區 ──
  &__content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding-top: 4rem;
  }

  // ── 置中區域 ──
  &__center {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 1rem 2rem;
  }

  // ── 卡片容器（md / lg 寬度不同） ──
  &__wrapper {
    position: relative;
    width: 100%;

    .glass-card--md & {
      max-width: 28rem;
    }

    .glass-card--lg & {
      max-width: 32rem;
    }
  }

  &__glow {
    position: absolute;
    inset: -4px;
    border-radius: 1.5rem;
    background: linear-gradient(to right, rgba(168, 85, 247, 0.3), rgba($accent, 0.3), rgba(168, 85, 247, 0.3));
    filter: blur(16px);
    animation: pulse-slow 3s ease-in-out infinite;
  }

  &__body {
    position: relative;
    border-radius: 1.5rem;
    background: rgba($bg-dark, 0.5);
    backdrop-filter: blur(24px);
    border: 1px solid rgba($border-base, 0.5);
    box-shadow: 0 0 60px rgba(139, 92, 246, 0.2);

    .glass-card--md & {
      padding: 2rem 1.75rem;

      @media (min-width: 768px) {
        padding: 2.5rem 2.25rem;
      }
    }

    .glass-card--lg & {
      padding: 2rem;

      @media (min-width: 768px) {
        padding: 3rem;
      }
    }
  }

  // ── Icon ──
  &__icon-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 1.25rem;
    position: relative;

    .glass-card--lg & {
      margin-bottom: 1.5rem;
    }
  }

  &__icon-glow {
    position: absolute;
    margin: auto;
    border-radius: 50%;
    background: rgba($gradient-start, 0.2);
    filter: blur(16px);
    animation: pulse 2s ease-in-out infinite;

    .glass-card--md & {
      inset: -12px;
      width: calc(4rem + 24px);
      height: calc(4rem + 24px);

      @media (min-width: 768px) {
        width: calc(4.5rem + 24px);
        height: calc(4.5rem + 24px);
      }
    }

    .glass-card--lg & {
      inset: -12px;
      width: calc(5rem + 24px);
      height: calc(5rem + 24px);

      @media (min-width: 768px) {
        width: calc(6rem + 24px);
        height: calc(6rem + 24px);
      }
    }
  }

  &__icon {
    position: relative;
    border-radius: 1rem;
    background: linear-gradient(to bottom right, $gradient-start, $gradient-end);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 30px rgba($accent, 0.4);

    .glass-card--md & {
      width: 4rem;
      height: 4rem;

      @media (min-width: 768px) {
        width: 4.5rem;
        height: 4.5rem;
        border-radius: 1.125rem;
      }
    }

    .glass-card--lg & {
      width: 5rem;
      height: 5rem;

      @media (min-width: 768px) {
        width: 6rem;
        height: 6rem;
        border-radius: 1.25rem;
      }
    }
  }

  &__icon-svg {
    color: white;

    .glass-card--md & {
      width: 2rem;
      height: 2rem;

      @media (min-width: 768px) {
        width: 2.25rem;
        height: 2.25rem;
      }
    }

    .glass-card--lg & {
      width: 2.5rem;
      height: 2.5rem;

      @media (min-width: 768px) {
        width: 3rem;
        height: 3rem;
      }
    }
  }

  // ── 標題 ──
  &__title {
    font-weight: 800;
    text-align: center;
    margin-bottom: 0.5rem;
    background: linear-gradient(to right, $accent, #a855f7, $accent);
    background-size: 200% 200%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradient-shift 3s ease infinite;

    .glass-card--md & {
      font-size: 1.75rem;

      @media (min-width: 768px) {
        font-size: 2rem;
      }
    }

    .glass-card--lg & {
      font-size: 2.25rem;
      font-weight: 900;
      margin-bottom: 1rem;
      filter: drop-shadow(0 4px 3px rgba(0, 0, 0, 0.07));

      @media (min-width: 768px) {
        font-size: 3rem;
      }

      @media (min-width: 1024px) {
        font-size: 3.75rem;
      }
    }
  }

  &__subtitle {
    color: $text-muted;
    text-align: center;
    margin-bottom: 1.5rem;

    .glass-card--md & {
      font-size: 0.875rem;
    }

    .glass-card--lg & {
      font-size: 1.125rem;
      margin-bottom: 2rem;
    }
  }

  // ── 成功訊息 ──
  &__success {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background: rgba($success, 0.1);
    border: 1px solid rgba($success, 0.3);
    color: $success-light;
    font-size: 0.875rem;
    margin-bottom: 1.25rem;
  }

  &__success-icon {
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
    color: $success;
  }

  // ── 錯誤訊息 ──
  &__error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background: rgba($danger, 0.1);
    border: 1px solid rgba($danger, 0.3);
    color: #fca5a5;
    font-size: 0.875rem;
    margin-bottom: 1.25rem;
  }

  &__error-icon {
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
    color: $danger;
  }
}
</style>
