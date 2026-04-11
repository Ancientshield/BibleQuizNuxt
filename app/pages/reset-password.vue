<template>
  <OrganismGlassCard
    icon="lucide:lock-keyhole"
    title="設定新密碼"
    subtitle="請輸入你的新密碼。"
    :success-msg="successMsg"
    :error-msg="errorMsg"
  >
    <!-- 成功訊息裡的登入連結 -->
    <template #success>
      {{ successMsg }}
      <NuxtLink
        to="/login"
        class="reset-page__login-link"
      >
        前往登入
      </NuxtLink>
    </template>

    <!-- 表單 -->
    <form
      v-if="!successMsg"
      class="reset-page__form"
      @submit.prevent="handleSubmit"
    >
      <MoleculeAuthInput
        v-model="password"
        icon="lucide:lock"
        placeholder="新密碼"
        required
        autocomplete="new-password"
        toggleable
        hint="密碼至少 8 個字元"
      />

      <MoleculeAuthInput
        v-model="confirmPassword"
        icon="lucide:lock"
        placeholder="確認新密碼"
        required
        autocomplete="new-password"
        toggleable
      />

      <MoleculeGradientButton
        type="submit"
        text="設定新密碼"
        loading-text="處理中..."
        :loading="isLoading"
      />
    </form>

    <!-- 返回登入 -->
    <div class="reset-page__back">
      <NuxtLink
        to="/login"
        class="reset-page__back-link"
      >
        <Icon name="lucide:arrow-left" />
        返回登入
      </NuxtLink>
    </div>
  </OrganismGlassCard>
</template>

<script setup lang="ts">
const { resetPassword } = useAuthApi();
const route = useRoute();
const token = computed(() => route.query.token as string);

const password = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

const handleSubmit = async () => {
  if (password.value !== confirmPassword.value) {
    errorMsg.value = '兩次密碼不一致';
    return;
  }

  if (password.value.length < 8) {
    errorMsg.value = '密碼長度至少 8 個字元';
    return;
  }

  if (!token.value) {
    errorMsg.value = '重設連結無效，缺少 token';
    return;
  }

  isLoading.value = true;
  errorMsg.value = '';

  try {
    await resetPassword(token.value, password.value);
    successMsg.value = '密碼已重設成功！';
  } catch (err: unknown) {
    const fetchErr = err as { data?: { error?: string } };
    errorMsg.value = fetchErr.data?.error || '發生錯誤，請稍後再試';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.reset-page {
  &__form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__login-link {
    color: $accent;
    font-weight: 600;
    text-decoration: none;
    margin-left: 0.25rem;

    &:hover {
      text-decoration: underline;
    }
  }

  &__back {
    margin-top: 1.5rem;
    text-align: center;
  }

  &__back-link {
    display: inline-flex;
    align-items: center;
    gap: 0.375rem;
    color: $text-muted;
    font-size: 0.875rem;
    text-decoration: none;
    transition: color 0.2s;

    &:hover {
      color: $accent;
    }

    svg {
      width: 1rem;
      height: 1rem;
    }
  }
}
</style>
