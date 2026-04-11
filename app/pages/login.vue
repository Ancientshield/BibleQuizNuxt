<template>
  <OrganismGlassCard
    icon="lucide:user"
    :title="isRegister ? '建立帳號' : '歡迎回來'"
    :success-msg="successMsg"
    :error-msg="errorMsg"
    show-particles
  >
    <!-- 副標題：切換登入/註冊 -->
    <template #subtitle>
      <template v-if="isRegister">
        已有帳號？
        <AtomButton
          variant="primary"
          appearance="text-view"
          size="button-s"
          @click="switchMode(false)"
        >
          登入
        </AtomButton>
      </template>
      <template v-else>
        還沒有帳號？
        <AtomButton
          variant="primary"
          appearance="text-view"
          size="button-s"
          @click="switchMode(true)"
        >
          建立帳號
        </AtomButton>
      </template>
    </template>

    <!-- 表單 -->
    <form
      class="login-page__form"
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

      <MoleculeAuthInput
        v-model="password"
        icon="lucide:lock"
        :placeholder="isRegister ? '請輸入註冊密碼' : '請輸入登入密碼'"
        required
        autocomplete="current-password"
        toggleable
        :hint="isRegister ? '密碼至少 8 個字元' : undefined"
      />

      <!-- 忘記密碼（僅登入模式） -->
      <div
        v-if="!isRegister"
        class="login-page__forgot-row"
      >
        <AtomButton
          variant="primary"
          appearance="text-view"
          size="button-s"
          @click="handleForgot"
        >
          忘記密碼？
        </AtomButton>
      </div>

      <MoleculeGradientButton
        type="submit"
        :text="isRegister ? '註冊' : '登入'"
        loading-text="處理中..."
        :loading="isLoading"
      />
    </form>

    <!-- 分隔線 -->
    <div class="login-page__divider">
      <div class="login-page__divider-line" />
      <span class="login-page__divider-text">或</span>
      <div class="login-page__divider-line" />
    </div>

    <!-- 社群登入按鈕 -->
    <div class="login-page__social-list">
      <MoleculeSocialLoginButton
        v-for="p in socialProviders"
        :key="p.id"
        :icon="p.icon"
        :label="p.label"
        :color="p.color"
        @click="handleSocial(p.id)"
      />
    </div>

    <!-- 底部條款文字 -->
    <template #footer>
      <p class="login-page__footer">登入即表示你同意我們的服務條款和隱私政策</p>
    </template>
  </OrganismGlassCard>
</template>

<script setup lang="ts">
const auth = useAuthStore();
const { login: apiLogin, register: apiRegister } = useAuthApi();

// ── 表單狀態 ──
const isRegister = ref(false);
const email = ref('');
const password = ref('');
const isLoading = ref(false);
const errorMsg = ref('');
const successMsg = ref('');

// ── 切換登入 / 註冊模式 ──
const switchMode = (register: boolean) => {
  isRegister.value = register;
  errorMsg.value = '';
  successMsg.value = '';
};

// ── 表單送出 ──
const handleSubmit = async () => {
  isLoading.value = true;
  errorMsg.value = '';
  successMsg.value = '';

  try {
    const apiFn = isRegister.value ? apiRegister : apiLogin;
    const data = await apiFn(email.value, password.value);

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
// 四家 provider 的 icon 定義，template 用 v-for 渲染。
//
// icon 集合選擇的坑：
// - Google 用 `logos:` 集合（Gilbarbara Logos），裡面有官方多色品牌 icon，不用傳 color
// - LINE 注意！`logos:` 集合沒收 LINE，要用 `simple-icons:`（單色）並自己傳品牌綠 #06C755
//   @nuxt/icon 找不到 icon 時會靜默降級（空格子不報錯），踩過一次坑
// - GitHub / X 用 `mdi:` / `simple-icons:` 單色 icon，透過 color 傳淡灰色配合深色背景
//   （原本 X 是 #000 純黑，在深色卡片上幾乎看不見，改成 #e2e8f0 順便修掉）
interface SocialProvider {
  id: string;
  icon: string;
  label: string;
  color?: string;
}

const socialProviders: SocialProvider[] = [
  { id: 'GOOGLE', icon: 'logos:google-icon', label: 'Google' },
  { id: 'LINE', icon: 'simple-icons:line', label: 'LINE', color: '#06C755' },
  { id: 'GITHUB', icon: 'mdi:github', label: 'GitHub', color: '#e2e8f0' },
  { id: 'X', icon: 'simple-icons:x', label: 'X', color: '#e2e8f0' },
];

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
  // ── 表單 ──
  &__form {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  // ── 忘記密碼 ──
  &__forgot-row {
    display: flex;
    justify-content: flex-end;
    margin-top: -0.25rem;
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

  // ── 社群登入按鈕列 ──
  &__social-list {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  // ── 底部條款 ──
  &__footer {
    margin-top: 1.5rem;
    font-size: 0.75rem;
    color: #475569;
    text-align: center;
  }
}
</style>
