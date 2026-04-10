<script setup lang="ts">
export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  minWidth?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

export interface SortState {
  key: string;
  order: 'asc' | 'desc' | null;
}

export interface AtomTableProps {
  columns: TableColumn[];
  data: Record<string, unknown>[];
  emptyText?: string;
  striped?: boolean;
  hoverable?: boolean;
}

const props = withDefaults(defineProps<AtomTableProps>(), {
  emptyText: '沒有資料',
  striped: false,
  hoverable: true,
});

const emit = defineEmits<{
  sortChange: [payload: SortState];
  rowClick: [row: Record<string, unknown>, index: number];
}>();

const sortKey = ref<string | null>(null);
const sortOrder = ref<'asc' | 'desc' | null>(null);

const handleSort = (col: TableColumn) => {
  if (!col.sortable) return;

  if (sortKey.value !== col.key) {
    sortKey.value = col.key;
    sortOrder.value = 'asc';
  } else if (sortOrder.value === 'asc') {
    sortOrder.value = 'desc';
  } else {
    sortKey.value = null;
    sortOrder.value = null;
  }

  emit('sortChange', {
    key: sortKey.value ?? col.key,
    order: sortOrder.value,
  });
};

const sortClass = (col: TableColumn) => {
  if (!col.sortable) return '';
  if (sortKey.value !== col.key) return 'a-table__th--idle';
  return sortOrder.value === 'asc' ? 'a-table__th--asc' : 'a-table__th--desc';
};

const colStyle = (col: TableColumn) => {
  const s: Record<string, string> = {};
  if (col.width) s.width = col.width;
  if (col.minWidth) s.minWidth = col.minWidth;
  if (col.align) s.textAlign = col.align;
  return s;
};
</script>

<template>
  <div class="a-table-wrap">
    <table class="a-table">
      <thead>
        <tr>
          <th
            v-for="col in columns"
            :key="col.key"
            :style="colStyle(col)"
            :class="['a-table__th', { 'a-table__th--sortable': col.sortable }, sortClass(col)]"
            @click="handleSort(col)"
          >
            <span class="a-table__th-content">
              <span>{{ col.label }}</span>
              <span
                v-if="col.sortable"
                class="a-table__sort"
              >
                <svg
                  class="a-table__arrow a-table__arrow--up"
                  viewBox="0 0 10 6"
                >
                  <path
                    d="M5 0L10 6H0L5 0Z"
                    fill="currentColor"
                  />
                </svg>
                <svg
                  class="a-table__arrow a-table__arrow--down"
                  viewBox="0 0 10 6"
                >
                  <path
                    d="M5 6L0 0H10L5 6Z"
                    fill="currentColor"
                  />
                </svg>
              </span>
            </span>
          </th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-if="!data || data.length === 0"
          class="a-table__row--empty"
        >
          <td
            :colspan="columns.length"
            class="a-table__td--empty"
          >
            <slot name="empty">{{ emptyText }}</slot>
          </td>
        </tr>
        <template v-else>
          <tr
            v-for="(row, i) in data"
            :key="i"
            :class="[
              'a-table__row',
              { 'a-table__row--striped': striped && i % 2 === 1 },
              { 'a-table__row--hoverable': hoverable },
            ]"
            @click="emit('rowClick', row, i)"
          >
            <td
              v-for="col in columns"
              :key="col.key"
              class="a-table__td"
              :style="colStyle(col)"
            >
              <slot
                :name="`cell-${col.key}`"
                :row="row"
                :value="row[col.key]"
                :index="i"
              >
                {{ row[col.key] ?? '' }}
              </slot>
            </td>
          </tr>
        </template>
      </tbody>
    </table>
  </div>
</template>

<style lang="scss" scoped>
.a-table-wrap {
  width: 100%;
  overflow-x: auto;
  border-radius: 0.75rem;
  border: 1px solid rgba($border-base, 0.5);
}

.a-table {
  width: 100%;
  border-collapse: collapse;
}

// ── 表頭 ──
.a-table__th {
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  color: $text-muted;
  text-align: left;
  white-space: nowrap;
  user-select: none;
  background: rgba(30, 41, 59, 0.6);
  border-bottom: 1px solid rgba($border-base, 0.5);

  &--sortable {
    cursor: pointer;

    &:hover {
      color: $accent;
    }
  }
}

.a-table__th-content {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

// ── 排序箭頭 ──
.a-table__sort {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
}

.a-table__arrow {
  width: 8px;
  height: 5px;
  color: $text-dim;
  transition: color 0.15s;
}

.a-table__th--asc .a-table__arrow--up {
  color: $accent;
}

.a-table__th--desc .a-table__arrow--down {
  color: $accent;
}

// ── 表身 ──
.a-table__row {
  border-bottom: 1px solid rgba($border-base, 0.3);
  transition: background 0.15s;

  &--hoverable:hover {
    background: rgba(255, 255, 255, 0.03);
  }

  &--striped {
    background: rgba(30, 41, 59, 0.3);
  }
}

.a-table__td {
  padding: 0.625rem 0.75rem;
  font-size: 1rem;
  color: $text-primary;
  vertical-align: middle;
}

// ── 空狀態 ──
.a-table__td--empty {
  padding: 3rem;
  text-align: center;
  color: $text-dim;
}
</style>
