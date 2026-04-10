<template>
  <div class="navbar-root">
    <header
      class="navbar"
      :class="{ 'navbar--scrolled': isScrolled }"
    >
      <!-- 左側：漢堡選單 -->
      <button
        class="navbar__hamburger"
        @click="menuOpen = !menuOpen"
      >
        <Icon
          :name="menuOpen ? 'lucide:x' : 'lucide:menu'"
          class="navbar__hamburger-icon"
        />
      </button>

      <!-- 右側：登入狀態（常駐顯示） -->
      <div class="navbar__right">
        <!-- 未登入 -->
        <button
          v-if="!auth.isLoggedIn && !isLoginPage"
          class="navbar__login-btn"
          @click="navigateTo('/login')"
        >
          <Icon
            name="lucide:log-in"
            class="navbar__login-icon"
          />
          登入
        </button>

        <!-- 登入頁：回首頁 -->
        <button
          v-else-if="isLoginPage"
          class="navbar__login-btn"
          @click="navigateTo('/')"
        >
          <Icon
            name="lucide:home"
            class="navbar__login-icon"
          />
          回首頁
        </button>

        <!-- 已登入 -->
        <div
          v-else-if="auth.isLoggedIn"
          ref="userMenuRef"
          class="navbar__user"
        >
          <span class="navbar__user-name">{{ auth.user?.name || auth.user?.email }}</span>
          <button
            class="navbar__avatar"
            @click="userMenuOpen = !userMenuOpen"
          >
            <img
              v-if="auth.user?.avatarUrl"
              :src="auth.user.avatarUrl"
              :alt="auth.user.name || auth.user.email"
              class="navbar__avatar-img"
              referrerpolicy="no-referrer"
            />
            <span
              v-else
              class="navbar__avatar-text"
            >
              {{ auth.avatarLetter }}
            </span>
          </button>

          <!-- 頭像下拉 -->
          <Transition name="menu">
            <div
              v-if="userMenuOpen"
              class="navbar__user-dropdown"
            >
              <button
                class="navbar__user-dropdown-item navbar__user-dropdown-item--danger"
                @click="handleLogout"
              >
                <Icon
                  name="lucide:log-out"
                  class="navbar__user-dropdown-icon"
                />
                登出
              </button>
            </div>
          </Transition>
        </div>
      </div>
    </header>

    <!-- 漢堡展開選單 -->
    <Transition name="menu">
      <nav
        v-if="menuOpen"
        class="navbar-menu"
      >
        <button
          class="navbar-menu__item"
          @click="goTo('/')"
        >
          <Icon
            name="lucide:home"
            class="navbar-menu__icon"
          />
          首頁
        </button>

        <template v-if="auth.isLoggedIn">
          <button
            class="navbar-menu__item"
            @click="goTo('/questions/submissions')"
          >
            <Icon
              name="lucide:file-text"
              class="navbar-menu__icon"
            />
            我要投稿
          </button>

          <button
            class="navbar-menu__item"
            @click="goTo('/my-history')"
          >
            <Icon
              name="lucide:history"
              class="navbar-menu__icon"
            />
            我的紀錄
          </button>
        </template>

        <template v-if="auth.isAdmin">
          <div class="navbar-menu__divider" />
          <button
            class="navbar-menu__item"
            @click="goTo('/admin/questions')"
          >
            <Icon
              name="lucide:database"
              class="navbar-menu__icon"
            />
            進階管理
          </button>
        </template>
      </nav>
    </Transition>

    <!-- 點外面關閉 -->
    <Transition name="overlay">
      <div
        v-if="menuOpen"
        class="navbar-overlay"
        @click="menuOpen = false"
      />
    </Transition>
  </div>
</template>

<script setup lang="ts">
const auth = useAuthStore();
const route = useRoute();

const isLoginPage = computed(() => route.path === '/login');
const menuOpen = ref(false);
const userMenuOpen = ref(false);
const userMenuRef = ref<HTMLDivElement | null>(null);
const isScrolled = ref(false);

// 路由切換時自動關閉選單
watch(
  () => route.path,
  () => {
    menuOpen.value = false;
    userMenuOpen.value = false;
  }
);

// 點外面關閉頭像下拉
const onClickOutsideUser = (e: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target as Node)) {
    userMenuOpen.value = false;
  }
};

onMounted(() => {
  const onScroll = () => {
    isScrolled.value = window.scrollY > 20;
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  document.addEventListener('click', onClickOutsideUser);
  onUnmounted(() => {
    window.removeEventListener('scroll', onScroll);
    document.removeEventListener('click', onClickOutsideUser);
  });
});

const goTo = (path: string) => {
  menuOpen.value = false;
  navigateTo(path);
};

const handleLogout = () => {
  menuOpen.value = false;
  userMenuOpen.value = false;
  auth.logout();
  navigateTo('/', { replace: true });
};
</script>

<style lang="scss" scoped>
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 50;
  height: $navbar-height;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 1.5rem;
  background: transparent;
  transition:
    background 0.3s,
    border-color 0.3s;
  border-bottom: 1px solid transparent;

  &--scrolled {
    background: rgba($bg-dark, 0.7);
    backdrop-filter: blur(24px);
    border-bottom-color: rgba($border-base, 0.4);
  }

  // ── 漢堡按鈕 ──
  &__hamburger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.5rem;
    background: none;
    border: 1px solid rgba($border-base, 0.5);
    color: $text-muted;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      color: $accent;
      border-color: rgba($accent, 0.3);
      background: rgba($accent, 0.06);
    }

    &:active {
      transform: scale(0.93);
    }
  }

  &__hamburger-icon {
    width: 1.5rem;
    height: 1.5rem;
  }

  // ── 右側區域 ──
  &__right {
    display: flex;
    align-items: center;
  }

  // ── 登入按鈕（未登入） ──
  &__login-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.625rem 1.25rem;
    border-radius: 9999px;
    background: rgba($bg-dark, 0.5);
    backdrop-filter: blur(12px);
    border: 1px solid rgba($border-base, 0.5);
    color: $text-muted;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.25s;

    &:hover {
      background: rgba($bg-dark, 0.8);
      color: $accent;
      border-color: rgba($accent, 0.3);
      box-shadow: 0 0 16px rgba($accent, 0.15);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  &__login-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  // ── 已登入使用者區域 ──
  &__user {
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__user-name {
    color: $text-primary;
    font-size: 1rem;
    font-weight: 500;
    max-width: 10rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    @media (max-width: 480px) {
      display: none;
    }
  }

  // ── 已登入使用者（相對定位，讓下拉對齊） ──
  &__user {
    position: relative;
  }

  // ── 頭像 ──
  &__avatar {
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 50%;
    overflow: hidden;
    border: 1.5px solid rgba($accent, 0.4);
    box-shadow: 0 0 12px rgba($accent, 0.15);
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(to bottom right, $gradient-start, $gradient-end);
    flex-shrink: 0;
    cursor: pointer;
    padding: 0;
    transition: all 0.2s;

    &:hover {
      box-shadow: 0 0 18px rgba($accent, 0.3);
    }
  }

  // ── 頭像下拉選單 ──
  &__user-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    min-width: 7rem;
    padding: 0.375rem;
    background: rgba($bg-dark, 0.95);
    backdrop-filter: blur(24px);
    border: 1px solid rgba($border-base, 0.5);
    border-radius: 0.625rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  }

  &__user-dropdown-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.5rem 0.75rem;
    border-radius: 0.375rem;
    background: none;
    border: none;
    color: $text-primary;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &--danger:hover {
      background: rgba($danger, 0.1);
      color: $danger-light;
    }
  }

  &__user-dropdown-icon {
    width: 1rem;
    height: 1rem;
  }

  &__avatar-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  &__avatar-text {
    color: white;
    font-size: 1rem;
    font-weight: 700;
    line-height: 1;
  }
}

// ── 展開選單 ──
.navbar-menu {
  position: fixed;
  top: 4.25rem;
  left: 0;
  z-index: 49;
  width: 15rem;
  padding: 0.5rem;
  background: rgba($bg-dark, 0.92);
  backdrop-filter: blur(24px);
  border: 1px solid rgba($border-base, 0.5);
  border-top: none;
  border-radius: 0 0 0.75rem 0;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  &__item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 0.75rem;
    border-radius: 0.5rem;
    color: $text-primary;
    font-size: 1rem;
    font-weight: 500;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    width: 100%;
    transition: all 0.2s;

    &:hover {
      background: rgba($accent, 0.08);
      color: $accent;
    }

    &--danger:hover {
      background: rgba($danger, 0.1);
      color: $danger-light;
    }
  }

  &__icon {
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
  }

  &__divider {
    height: 1px;
    background: rgba($border-base, 0.5);
    margin: 0.25rem 0.5rem;
  }
}

// ── 背景遮罩 ──
.navbar-overlay {
  position: fixed;
  inset: 0;
  z-index: 48;
  background: rgba(0, 0, 0, 0.3);
}

// ── Transitions ──
.menu-enter-active,
.menu-leave-active {
  transition: all 0.2s ease;
}

.menu-enter-from,
.menu-leave-to {
  opacity: 0;
  transform: translateY(-0.5rem);
}

.overlay-enter-active,
.overlay-leave-active {
  transition: opacity 0.2s ease;
}

.overlay-enter-from,
.overlay-leave-to {
  opacity: 0;
}
</style>
