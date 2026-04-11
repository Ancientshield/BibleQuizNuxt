<!--
  MoleculeGradientButton — 漸層主按鈕（含光暈 + shine 掃光動畫）。

  用於所有主要 CTA：登入、註冊、開始挑戰、寄送重設信、再玩一次等。
  - size: md（一般表單送出按鈕）/ lg（首頁開始挑戰等大 CTA）
  - type: button（default，配合 @click）/ submit（表單送出用）
  - variant: default（cyan→purple 循環漸層）/ pink（cyan→purple→pink 單向漸層，給結算再玩一次用）
  - 預設文字用 `text` prop，需要自訂內容（例如夾 icon）就用 default slot

  為什麼不用 MoleculeAuthButton：之前的舊版 type 寫死 submit、
  字體大小寫死，結果 index.vue 的「開始挑戰」和表單送出沒辦法共用。
  改成 size + type 都可設定後就統一了。
-->
<template>
  <div
    class="grad-btn__wrapper"
    :class="[`grad-btn__wrapper--${size}`, `grad-btn__wrapper--${variant}`]"
  >
    <div class="grad-btn__glow" />
    <button
      :type="type"
      class="grad-btn"
      :class="[`grad-btn--${size}`, `grad-btn--${variant}`]"
      :disabled="loading"
      @click="$emit('click', $event)"
    >
      <div class="grad-btn__bg" />
      <div class="grad-btn__shine">
        <div class="grad-btn__shine-ray" />
      </div>
      <span class="grad-btn__text">
        <slot>{{ loading && loadingText ? loadingText : text }}</slot>
      </span>
    </button>
  </div>
</template>

<script setup lang="ts">
withDefaults(
  defineProps<{
    text?: string;
    loadingText?: string;
    loading?: boolean;
    type?: 'button' | 'submit';
    size?: 'md' | 'lg';
    variant?: 'default' | 'pink';
  }>(),
  {
    type: 'button',
    size: 'md',
    variant: 'default',
  }
);

defineEmits<{
  click: [event: MouseEvent];
}>();
</script>

<style lang="scss" scoped>
.grad-btn {
  position: relative;
  width: 100%;
  overflow: hidden;
  font-weight: 700;
  color: white;
  border: none;
  cursor: pointer;
  transition: all 0.3s;

  &--md {
    border-radius: 0.75rem;
    padding: 0.875rem;
    font-size: 1.0625rem;
  }

  &--lg {
    border-radius: 1rem;
    padding: 1rem;
    font-size: 1.25rem;

    @media (min-width: 768px) {
      padding: 1.25rem;
      font-size: 1.5rem;
    }
  }

  &:hover {
    transform: scale(1.01);
  }

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }

  &__wrapper {
    position: relative;
    width: 100%;

    &--md {
      margin-top: 0.5rem;
    }
  }

  &__glow {
    position: absolute;
    inset: -4px;
    border-radius: 0.75rem;
    background: linear-gradient(to right, $gradient-start, #a855f7);
    filter: blur(12px);
    opacity: 0.3;
    transition: opacity 0.3s;
    z-index: 0;

    .grad-btn__wrapper:hover & {
      opacity: 0.5;
    }

    .grad-btn__wrapper--lg & {
      border-radius: 1rem;
      opacity: 0.4;

      .grad-btn__wrapper:hover & {
        opacity: 0.6;
      }
    }

    // pink variant：粉紅光暈（結算再玩一次專用，視覺更亮眼）
    .grad-btn__wrapper--pink & {
      background: linear-gradient(to right, $accent, #a855f7, #ec4899);
      opacity: 0;

      .grad-btn__wrapper:hover & {
        opacity: 1;
      }
    }
  }

  &__bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, $gradient-start, #a855f7, $gradient-start);
    background-size: 200% 200%;
    animation: gradient-shift 15s ease infinite;

    // pink variant：cyan → purple → pink，不循環
    .grad-btn--pink & {
      background: linear-gradient(to right, $gradient-start, #a855f7, #ec4899);
      background-size: 100% 100%;
      animation: none;
    }
  }

  &__shine {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  &__shine-ray {
    position: absolute;
    inset: 0;
    width: 50%;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
    transform: skewX(12deg) translateX(-200%);

    .grad-btn:hover & {
      animation: button-shine 0.6s ease-out;
    }
  }

  &__text {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.75rem;
  }
}
</style>
