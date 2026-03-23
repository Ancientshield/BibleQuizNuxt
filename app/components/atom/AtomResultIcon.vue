<template>
  <!-- 正確：打勾 ✓ -->
  <svg
    v-if="type === 'correct'"
    class="result-icon result-icon--correct"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" />
  </svg>
  <!-- 錯誤：打叉 ✗ -->
  <svg
    v-else-if="type === 'wrong'"
    class="result-icon result-icon--wrong"
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    stroke-width="2"
  >
    <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
</template>

<script setup lang="ts">
defineProps<{
  type: 'correct' | 'wrong'; // 決定顯示 ✓ 或 ✗
}>();
</script>

<style lang="scss" scoped>
.result-icon {
  width: 1.5rem;
  height: 1.5rem;

  @media (min-width: 768px) {
    width: 2rem;
    height: 2rem;
  }

  &--correct {
    color: #34d399; // emerald-400
  }

  &--wrong {
    color: #f87171; // red-400
  }

  animation: scale-in 0.3s ease-out forwards; // 彈入動畫：0→1.2→1
}

@keyframes scale-in {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  50% {
    transform: scale(1.2);
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
