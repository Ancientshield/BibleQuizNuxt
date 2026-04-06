<template>
  <!-- 正確：打勾 ✓ -->
  <Icon
    v-if="type === 'correct'"
    name="lucide:check"
    class="result-icon result-icon--correct"
  />
  <!-- 錯誤：打叉 ✗ -->
  <Icon
    v-else-if="type === 'wrong'"
    name="lucide:x"
    class="result-icon result-icon--wrong"
  />
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
    color: $danger-light; // red-400
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
