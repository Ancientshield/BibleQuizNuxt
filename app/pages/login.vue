<template>
  <main class="login-page">
    <!-- 動態漸層背景（與首頁、答題頁同色系） -->
    <div class="login-page__bg login-page__bg--gradient" />
    <div class="login-page__bg login-page__bg--radial" />

    <!-- 浮動粒子 -->
    <div class="login-page__particles">
      <div
        v-for="i in 20"
        :key="i"
        class="login-page__particle"
        :style="getParticleStyle(i)"
      />
    </div>

    <!-- 主內容區 -->
    <div class="login-page__content">
      <!-- 垂直水平置中區域 -->
      <div class="login-page__center">
        <div class="login-page__card-wrapper">
          <!-- 卡片外圍光暈 -->
          <div class="login-page__card-glow" />

          <!-- 玻璃擬態主卡片 -->
          <div class="login-page__card">
            <!-- 使用者 Icon -->
            <div class="login-page__icon-wrapper">
              <div class="login-page__icon-glow" />
              <div class="login-page__icon">
                <Icon
                  name="lucide:user"
                  class="login-page__icon-svg"
                />
              </div>
            </div>

            <!-- 標題 -->
            <h1 class="login-page__title">{{ isRegister ? '建立帳號' : '歡迎回來' }}</h1>
            <p class="login-page__subtitle">
              <template v-if="isRegister">
                已有帳號？
                <button
                  class="login-page__toggle"
                  @click="switchMode(false)"
                >
                  登入
                </button>
              </template>
              <template v-else>
                還沒有帳號？
                <button
                  class="login-page__toggle"
                  @click="switchMode(true)"
                >
                  建立帳號
                </button>
              </template>
            </p>

            <!-- 成功訊息 -->
            <Transition name="fade">
              <div
                v-if="successMsg"
                class="login-page__success"
              >
                <Icon
                  name="lucide:circle-check"
                  class="login-page__success-icon"
                />
                {{ successMsg }}
              </div>
            </Transition>

            <!-- 錯誤訊息 -->
            <Transition name="fade">
              <div
                v-if="errorMsg"
                class="login-page__error"
              >
                <Icon
                  name="lucide:circle-alert"
                  class="login-page__error-icon"
                />
                {{ errorMsg }}
              </div>
            </Transition>

            <!-- 表單 -->
            <form
              class="login-page__form"
              @submit.prevent="handleSubmit"
            >
              <!-- Email 欄位 -->
              <div class="login-page__field">
                <div
                  class="login-page__input-wrapper"
                  :class="{ 'login-page__input-wrapper--focus': emailFocused }"
                >
                  <Icon
                    name="lucide:mail"
                    class="login-page__input-icon"
                  />
                  <input
                    v-model="email"
                    type="email"
                    placeholder="Email"
                    class="login-page__input"
                    required
                    autocomplete="email"
                    @focus="emailFocused = true"
                    @blur="emailFocused = false"
                  />
                </div>
              </div>

              <!-- 密碼欄位 -->
              <div class="login-page__field">
                <div
                  class="login-page__input-wrapper"
                  :class="{ 'login-page__input-wrapper--focus': passwordFocused }"
                >
                  <Icon
                    name="lucide:lock"
                    class="login-page__input-icon"
                  />
                  <input
                    v-model="password"
                    :type="showPassword ? 'text' : 'password'"
                    :placeholder="isRegister ? '請輸入註冊密碼' : '請輸入登入密碼'"
                    class="login-page__input"
                    required
                    autocomplete="current-password"
                    @focus="passwordFocused = true"
                    @blur="passwordFocused = false"
                  />
                  <button
                    type="button"
                    class="login-page__eye"
                    @click="showPassword = !showPassword"
                  >
                    <Icon
                      v-if="showPassword"
                      name="lucide:eye"
                    />
                    <Icon
                      v-else
                      name="lucide:eye-off"
                    />
                  </button>
                </div>
                <!-- 註冊模式：密碼提示 -->
                <p
                  v-if="isRegister"
                  class="login-page__hint"
                >
                  密碼至少 8 個字元
                </p>
              </div>

              <!-- 忘記密碼（僅登入模式） -->
              <div
                v-if="!isRegister"
                class="login-page__forgot-row"
              >
                <button
                  type="button"
                  class="login-page__forgot"
                  @click="handleForgot"
                >
                  忘記密碼？
                </button>
              </div>

              <!-- 送出按鈕 -->
              <div class="login-page__submit-wrapper">
                <div class="login-page__submit-glow" />
                <button
                  type="submit"
                  class="login-page__submit"
                  :disabled="isLoading"
                >
                  <div class="login-page__submit-bg" />
                  <div class="login-page__submit-shine">
                    <div class="login-page__submit-shine-ray" />
                  </div>
                  <span class="login-page__submit-text">
                    {{ isLoading ? '處理中...' : isRegister ? '註冊' : '登入' }}
                  </span>
                </button>
              </div>
            </form>

            <!-- 分隔線 -->
            <div class="login-page__divider">
              <div class="login-page__divider-line" />
              <span class="login-page__divider-text">或</span>
              <div class="login-page__divider-line" />
            </div>

            <!-- 社群登入按鈕 -->
            <div class="login-page__social-list">
              <!-- Google -->
              <button
                class="login-page__social-btn"
                @click="handleSocial('GOOGLE')"
              >
                <svg
                  class="login-page__social-icon"
                  viewBox="0 0 24 24"
                >
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                <span class="login-page__social-text">使用 Google 繼續</span>
              </button>

              <!-- LINE -->
              <button
                class="login-page__social-btn"
                @click="handleSocial('LINE')"
              >
                <svg
                  class="login-page__social-icon"
                  viewBox="0 0 24 24"
                  fill="#06C755"
                >
                  <path
                    d="M24 10.304C24 4.614 18.616.084 12 .084S0 4.614 0 10.304c0 5.056 4.48 9.3 10.517 10.1.41.094.97.282 1.11.646.126.33.082.842.04 1.17l-.164 1.044c-.054.33-.256 1.3 1.1.712 1.358-.588 7.27-4.292 9.916-7.346C24.16 14.572 24 12.5 24 10.304z"
                  />
                  <path
                    d="M19.365 12.862h-2.386a.326.326 0 0 1-.326-.326V8.11a.326.326 0 0 1 .326-.327h2.386a.328.328 0 0 1 0 .655h-2.06v1.128h2.06a.327.327 0 1 1 0 .654h-2.06v1.13h2.06a.328.328 0 0 1 0 .654v-.143zm-3.855.326a.328.328 0 0 1-.283-.164l-2.437-3.326v3.164a.327.327 0 1 1-.654 0V8.11a.326.326 0 0 1 .326-.327h.056a.33.33 0 0 1 .28.164l2.44 3.33V8.11a.326.326 0 1 1 .653 0v4.426a.327.327 0 0 1-.326.327h-.055zm-4.31 0a.327.327 0 0 1-.327-.326V8.11a.327.327 0 0 1 .654 0v4.426a.327.327 0 0 1-.327.326v.326zm-1.783 0H7.03a.327.327 0 0 1-.326-.326V8.11a.327.327 0 0 1 .654 0v4.098h1.76a.327.327 0 0 1 0 .654v.326z"
                    fill="#fff"
                  />
                </svg>
                <span class="login-page__social-text">使用 LINE 繼續</span>
              </button>

              <!-- GitHub -->
              <button
                class="login-page__social-btn"
                @click="handleSocial('GITHUB')"
              >
                <svg
                  class="login-page__social-icon"
                  viewBox="0 0 24 24"
                  fill="#e2e8f0"
                >
                  <path
                    d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
                  />
                </svg>
                <span class="login-page__social-text">使用 GitHub 繼續</span>
              </button>

              <!-- X (Twitter) -->
              <button
                class="login-page__social-btn"
                @click="handleSocial('X')"
              >
                <svg
                  class="login-page__social-icon login-page__social-icon--x"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#000"
                    d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"
                  />
                </svg>
                <span class="login-page__social-text">使用 X 繼續</span>
              </button>
            </div>
          </div>
        </div>

        <!-- 底部條款文字 -->
        <p class="login-page__footer">登入即表示你同意我們的服務條款和隱私政策</p>
      </div>
    </div>
  </main>
</template>

<script setup lang="ts">
import type { UserInfo } from '~/stores/auth';

/** 後端 /api/auth 回傳格式（token + UserInfo） */
interface AuthResponse extends UserInfo {
  token: string;
}

const auth = useAuthStore();

// ── 表單狀態 ──
const isRegister = ref(false);
const email = ref('');
const password = ref('');
const showPassword = ref(false);
const isLoading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

// ── 輸入框焦點狀態（驅動發光效果） ──
const emailFocused = ref(false);
const passwordFocused = ref(false);

// ── 切換登入 / 註冊模式 ──
const switchMode = (register: boolean) => {
  isRegister.value = register;
  errorMsg.value = '';
  successMsg.value = '';
};

// ── 浮動粒子樣式（與首頁相同邏輯） ──
const getParticleStyle = (i: number) => {
  const seed = i * 2654435761;
  const pseudo = (s: number) => ((s * 16807) % 2147483647) / 2147483647;
  return {
    left: `${pseudo(seed) * 100}%`,
    top: `${pseudo(seed + 1) * 100}%`,
    animationDelay: `${pseudo(seed + 2) * 5}s`,
    animationDuration: `${pseudo(seed + 3) * 10 + 10}s`,
  };
};

// ── 表單送出 ──
const handleSubmit = async () => {
  isLoading.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    const endpoint = isRegister.value ? '/api/auth/register' : '/api/auth/login';
    const data = await $fetch<AuthResponse>(endpoint, {
      method: 'POST',
      body: { email: email.value, password: password.value },
    });

    // 註冊成功但未驗證（token 為 null）→ 顯示驗證提示
    if (!data.token) {
      successMsg.value = '註冊成功！請到信箱查收驗證信，驗證後即可登入。';
      isRegister.value = false;
      email.value = '';
      password.value = '';
      return;
    }

    // 儲存 token + user 到 Pinia store（內部同步寫入 localStorage）
    auth.setAuth(data.token, {
      id: data.id,
      email: data.email,
      name: data.name,
      role: data.role,
      avatarUrl: data.avatarUrl,
    });

    // 導回首頁
    navigateTo('/', { replace: true });
  } catch (err: unknown) {
    const fetchErr = err as { data?: { error?: string } };
    errorMsg.value = fetchErr.data?.error || '發生錯誤，請稍後再試';
  } finally {
    isLoading.value = false;
  }
};

// ── 社群登入 ──
const handleSocial = (provider: string) => {
  const registrationId = provider.toLowerCase();
  window.location.href = `http://localhost:8080/oauth2/authorization/${registrationId}`;
};

// ── 忘記密碼 ──
const handleForgot = () => {
  navigateTo('/forgot-password');
};
</script>

<style lang="scss" scoped>
.login-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow: hidden;
  background: $bg-page;

  // ── 背景層 ──
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

  // ── 浮動粒子 ──
  &__particles {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
  }

  &__particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba($accent, 0.3);
    border-radius: 50%;
    animation: float 8s ease-in-out infinite;
  }

  // ── 主內容區 ──
  &__content {
    position: relative;
    z-index: 10;
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    padding-top: 4rem; // Navbar 高度
  }

  // ── 置中區域 ──
  &__center {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 1rem 2rem;
  }

  // ── 卡片容器 ──
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

  // ── 使用者 Icon ──
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

    @media (min-width: 768px) {
      width: calc(4.5rem + 24px);
      height: calc(4.5rem + 24px);
    }
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

    @media (min-width: 768px) {
      width: 4.5rem;
      height: 4.5rem;
      border-radius: 1.125rem;
    }
  }

  &__icon-svg {
    width: 2rem;
    height: 2rem;
    color: white;

    @media (min-width: 768px) {
      width: 2.25rem;
      height: 2.25rem;
    }
  }

  // ── 標題 ──
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

    @media (min-width: 768px) {
      font-size: 2rem;
    }
  }

  &__subtitle {
    color: $text-muted;
    text-align: center;
    font-size: 0.875rem;
    margin-bottom: 1.5rem;
  }

  &__toggle {
    color: $accent;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 600;
    transition: color 0.2s;

    &:hover {
      color: #a855f7;
    }
  }

  // ── 成功訊息 ──
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

  // ── 錯誤訊息 ──
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

  // ── 表單 ──
  &__form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  &__field {
    display: flex;
    flex-direction: column;
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

    .login-page__input-wrapper--focus & {
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

  &__eye {
    display: flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    cursor: pointer;
    color: $text-dim;
    padding: 0.25rem;
    transition: color 0.2s;

    svg {
      width: 1.125rem;
      height: 1.125rem;
    }

    &:hover {
      color: $text-muted;
    }
  }

  &__hint {
    margin-top: 0.375rem;
    margin-left: 0.25rem;
    font-size: 0.75rem;
    color: $text-dim;
  }

  // ── 忘記密碼 ──
  &__forgot-row {
    display: flex;
    justify-content: flex-end;
    margin-top: -0.25rem;
  }

  &__forgot {
    color: $text-muted;
    background: none;
    border: none;
    cursor: pointer;
    font-size: 0.8125rem;
    transition: color 0.2s;

    &:hover {
      color: $accent;
    }
  }

  // ── 送出按鈕 ──
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

    .login-page__submit-wrapper:hover & {
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

  &__submit-shine {
    position: absolute;
    inset: 0;
    overflow: hidden;
  }

  &__submit-shine-ray {
    position: absolute;
    inset: 0;
    width: 50%;
    background: linear-gradient(to right, transparent, rgba(255, 255, 255, 0.2), transparent);
    transform: skewX(12deg) translateX(-200%);

    .login-page__submit:hover & {
      animation: button-shine 0.6s ease-out;
    }
  }

  &__submit-text {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  // ── 分隔線 ──
  &__divider {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin: 1.5rem 0;
  }

  &__divider-line {
    flex: 1;
    height: 1px;
    background: rgba($border-base, 0.6);
  }

  &__divider-text {
    color: $text-dim;
    font-size: 0.8125rem;
  }

  // ── 社群登入按鈕 ──
  &__social-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  &__social-btn {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    width: 100%;
    padding: 0.75rem 1rem;
    border-radius: 0.75rem;
    background: rgba(30, 41, 59, 0.5);
    border: 1px solid rgba($border-base, 0.5);
    color: $text-primary;
    font-size: 0.875rem;
    cursor: pointer;
    transition: all 0.25s;

    &:hover {
      background: rgba(30, 41, 59, 0.8);
      border-color: rgba(71, 85, 105, 0.7);
      transform: translateY(-1px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    }

    &:active {
      transform: translateY(0);
    }
  }

  &__social-icon {
    width: 1.25rem;
    height: 1.25rem;
    flex-shrink: 0;
  }

  &__social-text {
    font-weight: 500;
  }

  // ── 底部條款 ──
  &__footer {
    margin-top: 1.5rem;
    font-size: 0.75rem;
    color: #475569;
    text-align: center;
  }
}

// ── Transition ──
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

// ── Keyframes ──
@keyframes gradient-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) translateX(0);
    opacity: 0.3;
  }
  25% {
    transform: translateY(-20px) translateX(10px);
    opacity: 0.6;
  }
  50% {
    transform: translateY(-40px) translateX(-10px);
    opacity: 0.3;
  }
  75% {
    transform: translateY(-20px) translateX(5px);
    opacity: 0.6;
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

@keyframes button-shine {
  0% {
    transform: skewX(12deg) translateX(-200%);
  }
  100% {
    transform: skewX(12deg) translateX(400%);
  }
}
</style>
