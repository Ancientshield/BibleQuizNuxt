<template>
  <div class="o-filter">
    <div class="o-filter__fields">
      <slot />
    </div>
    <div class="o-filter__actions">
      <AtomButton
        variant="primary"
        size="button-m"
        @click="emit('search')"
      >
        <Icon
          name="lucide:search"
          class="o-filter__btn-icon"
        />
        搜尋
      </AtomButton>
      <AtomButton
        variant="primary"
        appearance="outline-view"
        size="button-m"
        @click="emit('clear')"
      >
        <Icon
          name="lucide:rotate-ccw"
          class="o-filter__btn-icon"
        />
        清除
      </AtomButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  search: [];
  clear: [];
}>();
</script>

<style lang="scss" scoped>
.o-filter {
  padding: 1.25rem;
  border-radius: 0.75rem;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba($border-base, 0.5);
  margin-bottom: 1.5rem;

  // ── Grid layout ──
  &__fields {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(14rem, 1fr));
    gap: 0.75rem;
    margin-bottom: 1rem;
  }

  // ── 按鈕列 ──
  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
  }

  &__btn-icon {
    width: 1rem;
    height: 1rem;
  }
}
</style>
