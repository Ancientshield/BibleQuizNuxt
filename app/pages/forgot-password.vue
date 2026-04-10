<template>
  <main class="forgot-page">
    <div class="forgot-page__bg forgot-page__bg--gradient" />
    <div class="forgot-page__bg forgot-page__bg--radial" />

    <div class="forgot-page__content">
      <div class="forgot-page__center">
        <div class="forgot-page__card-wrapper">
          <div class="forgot-page__card-glow" />

          <div class="forgot-page__card">
            <!-- Icon -->
            <div class="forgot-page__icon-wrapper">
              <div class="forgot-page__icon-glow" />
              <div class="forgot-page__icon">
                <Icon
                  name="lucide:key-round"
                  class="forgot-page__icon-svg"
                />
              </div>
            </div>

            <h1 class="forgot-page__title">忘記密碼</h1>
            <p class="forgot-page__subtitle">輸入你的 Email，我們會寄一封重設密碼的信給你。</p>

            <!-- 成功訊息 -->
            <Transition name="fade">
              <div
                v-if="successMsg"
                class="forgot-page__success"
              >
                <Icon
                  name="lucide:circle-check"
                  class="forgot-page__success-icon"
                />
                {{ successMsg }}
              </div>
            </Transition>

            <!-- 錯誤訊息 -->
            <Transition name="fade">
              <div
                v-if="errorMsg"
                class="forgot-page__error"
              >
                <Icon
                  name="lucide:circle-alert"
                  class="forgot-page__error-icon"
                />
                {{ errorMsg }}
              </div>
            </Transition>

            <!-- 表單 -->
            <form
              v-if="!successMsg"
              class="forgot-page__form"
              @submit.prevent="handleSubmit"
            >
              <div class="forgot-page__field">
                <div
                  class="forgot-page__input-wrapper"
                  :class="{ 'forgot-page__input-wrapper--focus': emailFocused }"
                >
                  <Icon
                    name="lucide:mail"
                    class="forgot-page__input-icon"
                  />
                  <input
                    v-model="email"
                    type="email"
                    placeholder="Email"
                    class="forgot-page__input"
                    required
                    autocomplete="email"
                    @focus="emailFocused = true"
                    @blur="emailFocused = false"
                  />
                </div>
              </div>

              <div class="forgot-page__submit-wrapper">
                <div class="forgot-page__submit-glow" />
                <button
                  type="submit"
                  class="forgot-page__submit"
                  :disabled="isLoading"
                >
                  <div class="forgot-page__submit-bg" />
                  <span class="forgot-page__submit-text">
                    {{ isLoading ? '寄送中...' : '寄送重設信' }}
                  </span>
                </button>
              </div>
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
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
const { forgotPassword } = useAuthApi();

const email = ref('');
const isLoading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');
const emailFocused = ref(false);

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
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  background: $bg-page;

  &__bg {
    position: absolute;
    inset: 0;

    &--gradient {
      background: linear-gradient(to bottom right, #581c87, $bg-dark, #1e3a5f);
      background-size: 200% 200%;
      animation: gradient-shift 15s ease infinite;
    }

    &--radial {
      background: radial-gradient(ellipse at top, rgba(107, 33, 168, 0.2), transparent, transparent);
    }
  }

  &__content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding-top: 4rem;
  }

  &__center {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 1rem 2rem;
  }

  &__card-wrapper {
    position: relative;
    width: 100%;
    max-width: 28rem;
  }

  &__card-glow {
    position: absolute;
    inset: -4px;
    border-radius: 1.5rem;
    background: linear-gradient(to right, rgba(168, 85, 247, 0.3), rgba($accent, 0.3), rgba(168, 85, 247, 0.3));
    filter: blur(16px);
    animation: pulse-slow 3s ease-in-out infinite;
  }

  &__card {
    position: relative;
    border-radius: 1.5rem;
    background: rgba($bg-dark, 0.5);
    backdrop-filter: blur(24px);
    border: 1px solid rgba($border-base, 0.5);
    padding: 2rem 1.75rem;
    box-shadow: 0 0 60px rgba(139, 92, 246, 0.2);

    @media (min-width: 768px) {
      padding: 2.5rem 2.25rem;
    }
  }

  &__icon-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 1.25rem;
    position: relative;
  }

  &__icon-glow {
    position: absolute;
    inset: -12px;
    width: calc(4rem + 24px);
    height: calc(4rem + 24px);
    margin: auto;
    border-radius: 50%;
    background: rgba($gradient-start, 0.2);
    filter: blur(16px);
    animation: pulse 2s ease-in-out infinite;
  }

  &__icon {
    position: relative;
    width: 4rem;
    height: 4rem;
    border-radius: 1rem;
    background: linear-gradient(to bottom right, $gradient-start, $gradient-end);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 0 30px rgba($accent, 0.4);
  }

  &__icon-svg {
    width: 2rem;
    height: 2rem;
    color: white;
  }

  &__title {
    font-size: 1.75rem;
    font-weight: 800;
    text-align: center;
    margin-bottom: 0.5rem;
    background: linear-gradient(to right, $accent, #a855f7, $accent);
    background-size: 200% 200%;
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    animation: gradient-text 3s ease infinite;
  }

  &__subtitle {
    color: $text-muted;
    text-align: center;
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
  }

  &__success {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background: rgba($success, 0.1);
    border: 1px solid rgba($success, 0.3);
    color: $success-light;
    font-size: 0.875rem;
    margin-bottom: 1.25rem;
  }

  &__success-icon {
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
    color: $success;
  }

  &__error {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background: rgba($danger, 0.1);
    border: 1px solid rgba($danger, 0.3);
    color: #fca5a5;
    font-size: 0.875rem;
    margin-bottom: 1.25rem;
  }

  &__error-icon {
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
    color: $danger;
  }

  &__form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__input-wrapper {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0 1rem;
    height: 3.25rem;
    border-radius: 0.75rem;
    background: rgba(30, 41, 59, 0.6);
    border: 1px solid rgba($border-base, 0.5);
    transition: all 0.25s;

    &--focus {
      border-color: rgba($accent, 0.5);
      box-shadow: 0 0 16px rgba($accent, 0.15);
      background: rgba(30, 41, 59, 0.8);
    }
  }

  &__input-icon {
    width: 1.125rem;
    height: 1.125rem;
    color: $text-dim;
    flex-shrink: 0;
    transition: color 0.25s;

    .forgot-page__input-wrapper--focus & {
      color: $accent;
    }
  }

  &__input {
    flex: 1;
    background: none;
    border: none;
    outline: none;
    color: $text-bright;
    font-size: 0.9375rem;

    &::placeholder {
      color: $text-dim;
    }
  }

  &__submit-wrapper {
    position: relative;
    width: 100%;
    margin-top: 0.5rem;
  }

  &__submit-glow {
    position: absolute;
    inset: -4px;
    border-radius: 0.75rem;
    background: linear-gradient(to right, $gradient-start, #a855f7);
    filter: blur(12px);
    opacity: 0.3;
    transition: opacity 0.3s;
    z-index: 0;

    .forgot-page__submit-wrapper:hover & {
      opacity: 0.5;
    }
  }

  &__submit {
    position: relative;
    width: 100%;
    overflow: hidden;
    border-radius: 0.75rem;
    padding: 0.875rem;
    font-weight: 700;
    font-size: 1.0625rem;
    color: white;
    border: none;
    cursor: pointer;
    transition: all 0.3s;

    &:hover {
      transform: scale(1.01);
    }

    &:active {
      transform: scale(0.98);
    }

    &:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none;
    }
  }

  &__submit-bg {
    position: absolute;
    inset: 0;
    background: linear-gradient(to right, $gradient-start, #a855f7, $gradient-start);
    background-size: 200% 200%;
    animation: gradient-shift 15s ease infinite;
  }

  &__submit-text {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
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

@keyframes gradient-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes gradient-text {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes pulse {
  0%,
  100% {
    opacity: 0.4;
  }
  50% {
    opacity: 0.8;
  }
}

@keyframes pulse-slow {
  0%,
  100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.6;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
