/** 使用者資訊（對應後端 AuthResponse，不含 token） */
export interface UserInfo {
  id: number;
  email: string;
  name: string | null;
  role: string;
  avatarUrl: string | null;
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(null);
  const user = ref<UserInfo | null>(null);
  const initialized = ref(false);

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'ADMIN');

  /** 文字頭像：name 首字 or email 首字，轉大寫 */
  const avatarLetter = computed(() => {
    if (!user.value) return '';
    const src = user.value.name || user.value.email;
    return src.charAt(0).toUpperCase();
  });

  /** 從 localStorage 載入登入狀態（client-side only，僅執行一次） */
  function init() {
    if (initialized.value || import.meta.server) return;
    token.value = localStorage.getItem('token');
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        user.value = JSON.parse(raw);
      } catch {
        /* ignore */
      }
    }
    initialized.value = true;
  }

  /** 登入成功後儲存 token + user */
  function setAuth(newToken: string, newUser: UserInfo) {
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    initialized.value = true;
  }

  /** 登出：清除所有狀態 */
  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return { token, user, initialized, isLoggedIn, isAdmin, avatarLetter, init, setAuth, logout };
});
