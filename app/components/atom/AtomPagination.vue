<template>
  <nav
    v-if="totalPages > 1"
    class="a-page"
  >
    <!-- 上一頁 -->
    <button
      class="a-page__btn"
      :disabled="currentPage <= 1"
      @click="goTo(currentPage - 1)"
    >
      <Icon
        name="lucide:chevron-left"
        class="a-page__icon"
      />
    </button>

    <!-- 第 1 頁 -->
    <button
      :class="['a-page__btn', { 'a-page__btn--active': currentPage === 1 }]"
      @click="goTo(1)"
    >
      1
    </button>

    <!-- 前省略號 -->
    <span
      v-if="showPrevEllipsis"
      class="a-page__ellipsis"
      @click="goTo(currentPage - jumpStep)"
    >
      ···
    </span>

    <!-- 中間頁碼 -->
    <button
      v-for="p in middlePages"
      :key="p"
      :class="['a-page__btn', { 'a-page__btn--active': currentPage === p }]"
      @click="goTo(p)"
    >
      {{ p }}
    </button>

    <!-- 後省略號 -->
    <span
      v-if="showNextEllipsis"
      class="a-page__ellipsis"
      @click="goTo(currentPage + jumpStep)"
    >
      ···
    </span>

    <!-- 最後一頁 -->
    <button
      v-if="totalPages > 1"
      :class="['a-page__btn', { 'a-page__btn--active': currentPage === totalPages }]"
      @click="goTo(totalPages)"
    >
      {{ totalPages }}
    </button>

    <!-- 下一頁 -->
    <button
      class="a-page__btn"
      :disabled="currentPage >= totalPages"
      @click="goTo(currentPage + 1)"
    >
      <Icon
        name="lucide:chevron-right"
        class="a-page__icon"
      />
    </button>
  </nav>
</template>

<script setup lang="ts">
interface AtomPaginationProps {
  total: number;
  pageSize?: number;
  currentPage?: number;
  maxPagers?: number;
}

const props = withDefaults(defineProps<AtomPaginationProps>(), {
  pageSize: 10,
  currentPage: 1,
  maxPagers: 7,
});

const emit = defineEmits<{
  'update:currentPage': [page: number];
}>();

const pagerCount = computed(() => Math.max(5, props.maxPagers));
const totalPages = computed(() => Math.max(1, Math.ceil(props.total / props.pageSize)));
const jumpStep = computed(() => Math.max(1, pagerCount.value - 2));

// 中間要顯示幾個頁碼（扣掉頭尾兩個固定頁碼）
const middleSlots = computed(() => pagerCount.value - 2);

const showPrevEllipsis = computed(() => props.currentPage > Math.ceil(middleSlots.value / 2) + 1);
const showNextEllipsis = computed(() => props.currentPage < totalPages.value - Math.floor(middleSlots.value / 2));

const middlePages = computed(() => {
  if (totalPages.value <= 2) return [];

  const slots = middleSlots.value;
  let start: number;
  let end: number;

  if (!showPrevEllipsis.value && showNextEllipsis.value) {
    // 靠左
    start = 2;
    end = Math.min(start + slots - 1, totalPages.value - 1);
  } else if (showPrevEllipsis.value && !showNextEllipsis.value) {
    // 靠右
    end = totalPages.value - 1;
    start = Math.max(end - slots + 1, 2);
  } else if (showPrevEllipsis.value && showNextEllipsis.value) {
    // 居中
    const half = Math.floor((slots - 1) / 2);
    start = props.currentPage - half;
    end = props.currentPage + (slots - 1 - half);
    if (start < 2) {
      start = 2;
      end = start + slots - 1;
    }
    if (end > totalPages.value - 1) {
      end = totalPages.value - 1;
      start = end - slots + 1;
    }
  } else {
    // 全部顯示
    start = 2;
    end = totalPages.value - 1;
  }

  const pages: number[] = [];
  for (let i = start; i <= end; i++) pages.push(i);
  return pages;
});

const goTo = (page: number) => {
  const clamped = Math.max(1, Math.min(page, totalPages.value));
  if (clamped !== props.currentPage) {
    emit('update:currentPage', clamped);
  }
};
</script>

<style lang="scss" scoped>
.a-page {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.25rem;
  padding: 1rem 0;

  // ── 頁碼按鈕 ──
  &__btn {
    min-width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0 0.375rem;
    border-radius: 0.5rem;
    border: 1px solid transparent;
    background: transparent;
    color: $text-muted;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &:hover:not(:disabled):not(&--active) {
      color: $text-bright;
      background: rgba(255, 255, 255, 0.05);
    }

    &--active {
      background: rgba($accent, 0.15);
      color: $accent;
      border-color: rgba($accent, 0.3);
    }

    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }

  // ── 省略號 ──
  &__ellipsis {
    min-width: 2rem;
    height: 2rem;
    display: flex;
    align-items: center;
    justify-content: center;
    color: $text-dim;
    cursor: pointer;
    font-size: 1rem;
    letter-spacing: 0.05em;

    &:hover {
      color: $accent;
    }
  }

  // ── Icon ──
  &__icon {
    width: 1rem;
    height: 1rem;
  }
}
</style>
