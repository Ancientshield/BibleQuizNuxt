<template>
  <Teleport to="body">
    <Transition name="modal">
      <div
        v-if="modelValue"
        class="cats-modal__overlay"
        @click.self="close"
      >
        <div class="cats-modal">
          <h2 class="cats-modal__title">管理分類</h2>
          <p class="cats-modal__desc">新增、改名、刪除題目分類。使用者端永遠只能下拉選擇既有分類，不開放自創。</p>

          <!-- 新增 -->
          <div class="cats-modal__add">
            <input
              v-model="newName"
              class="cats-modal__input"
              placeholder="例如：海德堡要理問答"
              @keydown.enter="handleCreate"
            />
            <AtomButton
              :disabled="!newName.trim() || loading"
              @click="handleCreate"
            >
              新增
            </AtomButton>
          </div>

          <!-- 列表 -->
          <div class="cats-modal__list">
            <div
              v-for="c in categories"
              :key="c.id"
              class="cats-modal__row"
            >
              <template v-if="editingId === c.id">
                <input
                  v-model="editingName"
                  class="cats-modal__input cats-modal__row-input"
                  @keydown.enter="handleUpdate(c.id)"
                  @keydown.esc="editingId = null"
                />
                <button
                  type="button"
                  class="cats-modal__btn cats-modal__btn--save"
                  :disabled="!editingName.trim() || loading"
                  @click="handleUpdate(c.id)"
                >
                  儲存
                </button>
                <button
                  type="button"
                  class="cats-modal__btn"
                  @click="editingId = null"
                >
                  取消
                </button>
              </template>
              <template v-else>
                <span class="cats-modal__name">{{ c.name }}</span>
                <button
                  type="button"
                  class="cats-modal__btn"
                  @click="startEditing(c)"
                >
                  改名
                </button>
                <button
                  type="button"
                  class="cats-modal__btn cats-modal__btn--danger"
                  :disabled="loading"
                  @click="handleDelete(c)"
                >
                  刪除
                </button>
              </template>
            </div>
            <p
              v-if="!categories.length"
              class="cats-modal__empty"
            >
              還沒有任何分類
            </p>
          </div>

          <div class="cats-modal__actions">
            <AtomButton
              appearance="outline-view"
              @click="close"
            >
              完成
            </AtomButton>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
/**
 * OrganismCategoriesManagerModal — 管理題目分類的 Modal。
 *
 * 從 admin/questions.vue 的「核准 Modal」跟「編輯 Modal」的分類下拉旁邊進來，
 * 讓管理者就地新增 / 改名 / 刪除分類，不用跳頁。CRUD 完成後 emit 'refresh' 讓
 * 父層 reload `categories`，下拉選單會立即反映變動。
 *
 * 刪除有 FK 保護：後端會在該分類還有題目時回 409，錯誤訊息直接顯示給管理者，
 * 要先把題目遷移到其他分類才能刪。
 */
import type { AdminCategory } from '~/composables/useAdminQuestionApi';

interface Props {
  modelValue: boolean;
  categories: AdminCategory[];
}

const props = defineProps<Props>();
const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  refresh: [];
}>();

const adminApi = useAdminQuestionApi();

const newName = ref('');
const editingId = ref<number | null>(null);
const editingName = ref('');
const loading = ref(false);

// 關 Modal 時清所有 local state，避免下次開啟殘留上次的編輯狀態
const close = () => {
  newName.value = '';
  editingId.value = null;
  editingName.value = '';
  emit('update:modelValue', false);
};

const extractError = (e: unknown): string | undefined => {
  const err = e as { data?: { message?: string } };
  return err?.data?.message;
};

const handleCreate = async () => {
  const name = newName.value.trim();
  if (!name || loading.value) return;
  loading.value = true;
  try {
    await adminApi.createCategory(name);
    newName.value = '';
    emit('refresh');
  } catch (e) {
    alert(extractError(e) || '新增分類失敗');
  } finally {
    loading.value = false;
  }
};

const startEditing = (c: AdminCategory) => {
  editingId.value = c.id;
  editingName.value = c.name;
};

const handleUpdate = async (id: number) => {
  const name = editingName.value.trim();
  if (!name || loading.value) return;
  loading.value = true;
  try {
    await adminApi.updateCategory(id, name);
    editingId.value = null;
    editingName.value = '';
    emit('refresh');
  } catch (e) {
    alert(extractError(e) || '改名失敗');
  } finally {
    loading.value = false;
  }
};

const handleDelete = async (c: AdminCategory) => {
  if (!confirm(`確定要刪除「${c.name}」分類？此操作無法復原。`)) return;
  loading.value = true;
  try {
    await adminApi.deleteCategory(c.id);
    emit('refresh');
  } catch (e) {
    // 後端在分類底下還有題目時會回 409，訊息已經是中文
    alert(extractError(e) || '刪除失敗');
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.cats-modal {
  width: min(34rem, 92vw);
  max-height: 88vh;
  overflow-y: auto;
  background: rgba(15, 23, 42, 0.95);
  border: 1px solid rgba($border-base, 0.6);
  border-radius: 1rem;
  padding: 1.5rem;
  backdrop-filter: blur(24px);
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.6);

  &__overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.6);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1.5rem;
    z-index: 100;
  }

  &__title {
    font-size: 1.25rem;
    font-weight: 700;
    color: $text-bright;
    margin: 0 0 0.5rem;
  }

  &__desc {
    font-size: 1rem;
    color: $text-muted;
    margin: 0 0 1.25rem;
  }

  &__add {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  &__input {
    width: 100%;
    box-sizing: border-box;
    padding: 0.5rem 0.75rem;
    border-radius: 0.625rem;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba($border-base, 0.5);
    color: $text-bright;
    font-size: 1rem;
    outline: none;
    transition: all 0.25s;

    &:focus {
      border-color: rgba($accent, 0.5);
      box-shadow: 0 0 12px rgba($accent, 0.1);
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    max-height: 24rem;
    overflow-y: auto;
    padding-right: 0.25rem;
  }

  &__row {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 0.875rem;
    border-radius: 0.625rem;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba($border-base, 0.4);
  }

  &__row-input {
    flex: 1;
    padding: 0.375rem 0.625rem;
  }

  &__name {
    flex: 1;
    color: $text-bright;
    font-size: 1rem;
  }

  &__btn {
    padding: 0.375rem 0.75rem;
    font-size: 1rem;
    color: $text-muted;
    background: transparent;
    border: 1px solid rgba($border-base, 0.5);
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: $text-bright;
      border-color: rgba($accent, 0.5);
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    &--save {
      color: $accent;
      border-color: rgba($accent, 0.5);

      &:hover {
        background: rgba($accent, 0.1);
      }
    }

    &--danger {
      color: $danger-light;
      border-color: rgba($danger, 0.4);

      &:hover {
        background: rgba($danger, 0.1);
        border-color: rgba($danger, 0.6);
      }
    }
  }

  &__empty {
    text-align: center;
    color: $text-dim;
    font-size: 1rem;
    padding: 1rem 0;
    margin: 0;
  }

  &__actions {
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1.25rem;
  }
}

// Modal transition — 跟 admin/questions.vue 既有 Modal 一致
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.25s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
</style>
