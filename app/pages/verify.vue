<template>
  <main class="verify-page">
    <AtomGradientBackground />

    <div class="verify-page__center">
      <!-- Loading -->
      <template v-if="isLoading">
        <div class="verify-page__icon verify-page__icon--loading">
          <Icon
            name="lucide:loader-2"
            class="verify-page__icon-svg verify-page__icon-svg--spin"
          />
        </div>
        <p class="verify-page__msg">驗證中...</p>
      </template>

      <!-- 成功 -->
      <template v-else-if="success">
        <div class="verify-page__icon verify-page__icon--success">
          <Icon
            name="lucide:check"
            class="verify-page__icon-svg"
          />
        </div>
        <h1 class="verify-page__title verify-page__title--success">Email 驗證成功</h1>
        <p class="verify-page__msg">{{ countdown }} 秒後自動跳轉至登入頁</p>
        <NuxtLink
          to="/login"
          class="verify-page__btn"
        >
          前往登入
        </NuxtLink>
      </template>

      <!-- 失敗 -->
      <template v-else>
        <div class="verify-page__icon verify-page__icon--error">
          <Icon
            name="lucide:x"
            class="verify-page__icon-svg"
          />
        </div>
        <h1 class="verify-page__title verify-page__title--error">驗證失敗</h1>
        <p class="verify-page__msg">{{ errorMsg }}</p>
        <NuxtLink
          to="/login"
          class="verify-page__btn"
        >
          返回登入頁
        </NuxtLink>
      </template>
    </div>
  </main>
</template>

<script setup lang="ts">
const { verifyEmail } = useAuthApi();
const route = useRoute();
const router = useRouter();

const isLoading = ref(true);
const success = ref(false);
const errorMsg = ref('');
const countdown = ref(3);

onMounted(async () => {
  const token = route.query.token as string;

  if (!token) {
    isLoading.value = false;
    errorMsg.value = '驗證連結無效，缺少 token';
    return;
  }

  try {
    await verifyEmail(token);
    success.value = true;

    const timer = setInterval(() => {
      countdown.value--;
      if (countdown.value <= 0) {
        clearInterval(timer);
        router.replace('/login');
      }
    }, 1000);
  } catch (err: unknown) {
    const fetchErr = err as { data?: { error?: string } };
    errorMsg.value = fetchErr.data?.error || '驗證失敗，請稍後再試';
  } finally {
    isLoading.value = false;
  }
});
</script>

<style lang="scss" scoped>
.verify-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  background: $bg-page;

  &__center {
    position: relative;
    z-index: 10;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem;
    gap: 0.75rem;
  }

  &__icon {
    width: 4rem;
    height: 4rem;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 0.5rem;

    &--loading {
      background: rgba($text-dim, 0.1);
      border: 2px solid rgba($text-dim, 0.3);
    }

    &--success {
      background: rgba($success, 0.1);
      border: 2px solid rgba($success, 0.3);
    }

    &--error {
      background: rgba($danger, 0.1);
      border: 2px solid rgba($danger, 0.3);
    }
  }

  &__icon-svg {
    width: 1.75rem;
    height: 1.75rem;
    color: $text-muted;

    .verify-page__icon--success & {
      color: $success;
    }

    .verify-page__icon--error & {
      color: $danger;
    }

    &--spin {
      animation: spin 1s linear infinite;
    }
  }

  &__title {
    font-family: 'Noto Serif TC', serif;
    font-size: 1.5rem;
    font-weight: 700;

    &--success {
      color: $success;
    }

    &--error {
      color: $danger;
    }
  }

  &__msg {
    color: $text-muted;
    font-size: 0.9375rem;
  }

  &__btn {
    margin-top: 0.75rem;
    padding: 0.625rem 1.5rem;
    border-radius: 0.5rem;
    background: $primary;
    color: white;
    font-size: 0.875rem;
    font-weight: 500;
    text-decoration: none;
    transition: all 0.2s;

    &:hover {
      background: $primary-hover;
    }
  }
}
</style>
