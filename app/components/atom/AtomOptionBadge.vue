<template>
  <span :class="stateClass" class="badge">
    {{ label }}
  </span>
</template>

<script setup lang="ts">
// default=未作答 / correct=答對 / wrong=答錯 / disabled=未選中
type BadgeState = 'default' | 'correct' | 'wrong' | 'disabled';

const props = defineProps<{
  label: string; // 選項代號："A" | "B" | "C" | "D"
  state: BadgeState; // 視覺狀態，由父層 MoleculeOptionButton 傳入
}>();

// 根據 state 動態加上 BEM modifier class
const stateClass = computed(() => {
  switch (props.state) {
    case 'correct':
      return 'badge--correct';
    case 'wrong':
      return 'badge--wrong';
    case 'disabled':
      return 'badge--disabled';
    default:
      return 'badge--default';
  }
});
</script>

<style lang="scss" scoped>
.badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  border-radius: 0.5rem;
  font-weight: 700;
  font-size: 1rem;

  @media (min-width: 768px) {
    width: 2.5rem;
    height: 2.5rem;
    font-size: 1.125rem;
  }

  &--default {
    background: rgba(51, 65, 85, 0.8); // slate-700/80
    color: #22d3ee; // cyan-400
  }

  &--correct {
    background: rgba(16, 185, 129, 0.8); // emerald-500/80
    color: #fff;
  }

  &--wrong {
    background: rgba(239, 68, 68, 0.8); // red-500/80
    color: #fff;
  }

  &--disabled {
    background: rgba(51, 65, 85, 0.4); // slate-700/40
    color: rgb(100, 116, 139); // slate-500
  }
}
</style>
