<template>
  <div class="navbar-root">
    <header class="navbar">
      <!-- 左側：漢堡選單（手機）+ Logo -->
      <div class="navbar__left">
        <button
          class="navbar__hamburger"
          @click="menuOpen = !menuOpen"
        >
          <Icon
            :name="menuOpen ? 'lucide:x' : 'lucide:menu'"
            class="navbar__hamburger-icon"
          />
        </button>

        <NuxtLink
          to="/"
          class="navbar__logo"
        >
          <Icon
            name="lucide:book-open"
            class="navbar__logo-icon"
          />
          <span class="navbar__logo-text">Bible Quiz</span>
        </NuxtLink>
      </div>

      <!-- 中間：桌面導航連結 -->
      <nav class="navbar__nav">
        <NuxtLink
          to="/"
          class="navbar__nav-link"
          :class="{ 'navbar__nav-link--active': route.path === '/' }"
        >
          首頁
        </NuxtLink>
        <NuxtLink
          to="/questions/submissions"
          class="navbar__nav-link"
          :class="{ 'navbar__nav-link--active': route.path.startsWith('/questions') }"
        >
          投稿
        </NuxtLink>
        <NuxtLink
          to="/my-history"
          class="navbar__nav-link"
          :class="{ 'navbar__nav-link--active': route.path.startsWith('/my-history') }"
        >
          紀錄
        </NuxtLink>
        <NuxtLink
          v-if="auth.isAdmin"
          to="/admin/questions"
          class="navbar__nav-link"
          :class="{ 'navbar__nav-link--active': route.path.startsWith('/admin') }"
        >
          管理
        </NuxtLink>
      </nav>

      <!-- 右側：登入狀態 -->
      <div class="navbar__right">
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

        <button
          v-else-if="isLoginPage"
          class="navbar__home-btn"
          @click="navigateTo('/')"
        >
          <Icon
            name="lucide:home"
            class="navbar__login-icon"
          />
          回首頁
        </button>

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

    <!-- 漢堡展開選單（手機） -->
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

        <template v-if="auth.isAdmin">
          <div class="navbar-menu__divider" />
          <button
            class="navbar-menu__item"
            @click="goTo('/admin/questions')"
          >
            <Icon
              name="lucide:settings"
              class="navbar-menu__icon"
            />
            進階管理
          </button>
        </template>
      </nav>
    </Transition>

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

watch(
  () => route.path,
  () => {
    menuOpen.value = false;
    userMenuOpen.value = false;
  }
);

const onClickOutsideUser = (e: MouseEvent) => {
  if (userMenuRef.value && !userMenuRef.value.contains(e.target as Node)) {
    userMenuOpen.value = false;
  }
};

onMounted(() => {
  document.addEventListener('click', onClickOutsideUser);
  onUnmounted(() => {
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
  background: $bg-card;
  border-bottom: 1px solid $border-base;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.04);

  &__left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0;
  }

  &__hamburger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 2.5rem;
    height: 2.5rem;
    border-radius: 0.5rem;
    background: $primary;
    border: none;
    color: white;
    cursor: pointer;
    transition: all 0.2s;

    &:hover {
      background: $primary-hover;
    }

    &:active {
      transform: scale(0.93);
    }

    @media (min-width: 768px) {
      display: none;
    }
  }

  &__hamburger-icon {
    width: 1.25rem;
    height: 1.25rem;
  }

  &__logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-decoration: none;
    color: $text-heading;
  }

  &__logo-icon {
    width: 1.5rem;
    height: 1.5rem;
    color: $primary;
  }

  &__logo-text {
    font-family: 'Noto Serif TC', serif;
    font-size: 1.25rem;
    font-weight: 700;
    color: $text-heading;
  }

  // ── 桌面導航連結 ──
  &__nav {
    display: none;

    @media (min-width: 768px) {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }
  }

  &__nav-link {
    padding: 0.5rem 0.875rem;
    border-radius: 0.5rem;
    font-size: 0.9375rem;
    font-weight: 500;
    color: $text-muted;
    text-decoration: none;
    transition: all 0.2s;

    &:hover {
      color: $text-heading;
      background: $bg-subtle;
    }

    &--active {
      color: $primary;
      background: rgba($primary, 0.06);
    }
  }

  // ── 右側區域 ──
  &__right {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    flex: 1;
    min-width: 0;
  }

  &__login-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1.125rem;
    border-radius: 0.5rem;
    background: $primary;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 0.9375rem;
    font-weight: 600;
    transition: all 0.2s;
    box-shadow: 0 1px 3px rgba($primary, 0.2);

    &:hover {
      background: $primary-hover;
      box-shadow: 0 2px 6px rgba($primary, 0.3);
    }

    &:active {
      transform: scale(0.96);
    }
  }

  &__home-btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 1.125rem;
    border-radius: 0.5rem;
    background: $bg-subtle;
    border: 1px solid $border-base;
    color: $text-primary;
    cursor: pointer;
    font-size: 0.9375rem;
    font-weight: 500;
    transition: all 0.2s;

    &:hover {
      background: $border-base;
    }
  }

  &__login-icon {
    width: 1.125rem;
    height: 1.125rem;
  }

  &__user {
    position: relative;
    display: flex;
    align-items: center;
    gap: 0.75rem;
  }

  &__user-name {
    color: $text-primary;
    font-size: 0.9375rem;
    font-weight: 500;
    max-width: 10rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    @media (max-width: 480px) {
      display: none;
    }
  }

  &__avatar {
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 50%;
    overflow: hidden;
    border: 2px solid $border-base;
    display: flex;
    align-items: center;
    justify-content: center;
    background: $primary;
    flex-shrink: 0;
    cursor: pointer;
    padding: 0;
    transition: all 0.2s;

    &:hover {
      border-color: $primary;
    }
  }

  &__user-dropdown {
    position: absolute;
    top: calc(100% + 0.5rem);
    right: 0;
    min-width: 7rem;
    padding: 0.375rem;
    background: $bg-card;
    border: 1px solid $border-base;
    border-radius: 0.625rem;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
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
    font-size: 0.9375rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;

    &--danger:hover {
      background: rgba($danger, 0.06);
      color: $danger;
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
    font-size: 0.875rem;
    font-weight: 700;
    line-height: 1;
  }
}

// ── 展開選單（手機） ──
.navbar-menu {
  position: fixed;
  top: calc($navbar-height + 0.5rem);
  left: 1rem;
  z-index: 49;
  width: 15rem;
  max-width: calc(100vw - 2rem);
  padding: 0.5rem;
  background: $bg-card;
  border: 1px solid $border-base;
  border-radius: 0.75rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  gap: 0.25rem;

  @media (min-width: 768px) {
    display: none;
  }

  &__item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.625rem 0.75rem;
    border-radius: 0.5rem;
    color: $text-primary;
    font-size: 0.9375rem;
    font-weight: 600;
    text-decoration: none;
    background: none;
    border: none;
    cursor: pointer;
    width: 100%;
    transition: all 0.2s;

    &:hover {
      background: $bg-subtle;
      color: $text-heading;
    }

    &:active {
      transform: scale(0.98);
    }
  }

  &__icon {
    width: 1.125rem;
    height: 1.125rem;
    flex-shrink: 0;
    color: $text-muted;
  }

  &__divider {
    height: 1px;
    background: $border-base;
    margin: 0.25rem 0.5rem;
  }
}

.navbar-overlay {
  position: fixed;
  inset: 0;
  z-index: 48;
  background: rgba(0, 0, 0, 0.15);
}

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
