<template>
  <OrganismGlassCard
    icon="lucide:key-round"
    title="忘記密碼"
    subtitle="輸入你的 Email，我們會寄一封重設密碼的信給你。"
    :success-msg="successMsg"
    :error-msg="errorMsg"
  >
    <!-- 表單 -->
    <form
      v-if="!successMsg"
      class="forgot-page__form"
      @submit.prevent="handleSubmit"
    >
      <MoleculeAuthInput
        v-model="email"
        icon="lucide:mail"
        type="email"
        placeholder="Email"
        required
        autocomplete="email"
      />

      <MoleculeGradientButton
        type="submit"
        text="寄送重設信"
        loading-text="寄送中..."
        :loading="isLoading"
      />
    </form>

    <!-- 返回登入 -->
    <div class="forgot-page__back">
      <NuxtLink
        to="/login"
        class="forgot-page__back-link"
      >
        <Icon name="lucide:arrow-left" />
        返回登入
      </NuxtLink>
    </div>
  </OrganismGlassCard>
</template>

<script setup lang="ts">
const { forgotPassword } = useAuthApi();

const email = ref('');
const isLoading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

const handleSubmit = async () => {
  isLoading.value = true;
  errorMsg.value = '';

  try {
    await forgotPassword(email.value);
    successMsg.value = '重設密碼信已寄出，請查收信箱。';
  } catch (err: unknown) {
    const fetchErr = err as { data?: { error?: string } };
    errorMsg.value = fetchErr.data?.error || '發生錯誤，請稍後再試';
  } finally {
    isLoading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.forgot-page {
  &__form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
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
