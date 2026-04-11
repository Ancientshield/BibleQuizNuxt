<!--
  MoleculeTabs — 底線風格 tab 切換。

  提供 items 陣列（含 value + label + 可選 icon），透過 v-model 管理當前選中的 value。
  視覺：水平排列、下方底線、選中項亮 $accent 顏色 + 底線。

  為什麼不是 AtomButton：
  tab 有「互斥選中」的語意（一次只有一個 active），而且視覺是底線式而非填充式，
  跟 AtomButton 的 variant 系統不相容。獨立成 molecule 比較乾淨。
-->
<template>
  <div class="tabs">
    <button
      v-for="item in items"
      :key="item.value"
      type="button"
      class="tabs__item"
      :class="{ 'tabs__item--active': modelValue === item.value }"
      @click="$emit('update:modelValue', item.value)"
    >
      <Icon
        v-if="item.icon"
        :name="item.icon"
      />
      {{ item.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
export interface TabItem {
  value: string;
  label: string;
  icon?: string;
}

defineProps<{
  modelValue: string;
  items: TabItem[];
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<style lang="scss" scoped>
.tabs {
  display: flex;
  gap: 0.25rem;
  margin-bottom: 1.25rem;
  border-bottom: 1px solid rgba($border-base, 0.5);

  &__item {
    display: flex;
    align-items: center;
    gap: 0.375rem;
    padding: 0.625rem 1rem;
    background: none;
    border: none;
    border-bottom: 2px solid transparent;
    color: $text-muted;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: $text-bright;
    }

    &--active {
      color: $accent;
      border-bottom-color: $accent;
    }

    svg {
      width: 1rem;
      height: 1rem;
    }
  }
}
</style>
