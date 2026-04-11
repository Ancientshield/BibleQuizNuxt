<!--
  MoleculeSocialLoginButton — 社群登入按鈕。

  統一的玻璃按鈕樣式 + 品牌 icon + 文字，icon 名稱由 iconify 集合提供
  （logos: 多色品牌、mdi: / simple-icons: 單色），由外部傳入 color 控制顯色。

  為什麼獨立成 molecule：
  原本 4 個 provider 在 login.vue 重複 4 次相同的 HTML + 各自的 inline SVG，
  抽出來後 login.vue 只要一個 providers 陣列 + v-for。
-->
<template>
  <button
    type="button"
    class="social-btn"
    @click="$emit('click')"
  >
    <Icon
      :name="icon"
      class="social-btn__icon"
      :style="color ? { color } : undefined"
    />
    <span class="social-btn__text">使用 {{ label }} 繼續</span>
  </button>
</template>

<script setup lang="ts">
defineProps<{
  icon: string;
  label: string;
  /** 單色 icon 的顯色（多色品牌如 Google/LINE 不用傳） */
  color?: string;
}>();

defineEmits<{
  click: [];
}>();
</script>

<style lang="scss" scoped>
.social-btn {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: 0.75rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba($border-base, 0.5);
  color: $text-primary;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.25s;

  &:hover {
    background: rgba(30, 41, 59, 0.8);
    border-color: rgba(71, 85, 105, 0.7);
    transform: translateY(-1px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }

  &__icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }

  &__text {
    font-weight: 500;
  }
}
</style>
