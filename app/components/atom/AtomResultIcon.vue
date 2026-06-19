<template>
  <Icon
    v-if="type === 'correct'"
    name="lucide:check"
    class="result-icon result-icon--correct"
  />
  <Icon
    v-else-if="type === 'wrong'"
    name="lucide:x"
    class="result-icon result-icon--wrong"
  />
</template>

<script setup lang="ts">
defineProps<{
  type: 'correct' | 'wrong';
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
    color: $success;
  }

  &--wrong {
    color: $danger;
  }

  animation: scale-in 0.3s ease-out forwards;
}
</style>
