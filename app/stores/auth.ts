/**
 * useAuthStore — 登入狀態管理
 *
 * 儲存登入後的 token 與使用者資訊，並把資料同步到 localStorage，
 * 讓使用者關掉分頁再打開時還能記得「昨天已經登入過」。
 *
 * ──────────────────────────────────────────
 * 為什麼要有 init()？一般 Pinia store 不用 init 啊？
 * ──────────────────────────────────────────
 * 一般 store 的初始值寫死在 ref() 裡（例如 `const count = ref(0)`），
 * store 一建立就有值，不用 init。
 *
 * 但這個 store 的 token / user 真正的初始值在 localStorage 裡，
 * 必須「讀出來」才能還原狀態。理論上可以寫：
 *
 *   const token = ref(localStorage.getItem('token'));  // ← 不行！
 *
 * 但這會在 SSG/SSR 預渲染爆掉 —— 因為預渲染跑在 Node.js，沒有 localStorage，
 * 會拋 ReferenceError。所以必須延後到瀏覽器端才讀，這就是 init() 的用途。
 *
 * ──────────────────────────────────────────
 * init() 由誰呼叫？
 * ──────────────────────────────────────────
 * 1. plugins/auth.client.ts → app 啟動時呼叫一次（主要路徑）
 * 2. middleware/auth.ts 和 middleware/admin.ts → 每次導航時防禦性呼叫
 *
 * 內部用 initialized flag 擋重複執行，所以多次呼叫只會讀 localStorage 一次，
 * 後續呼叫直接 return，成本只有一個 if 判斷。
 *
 * ──────────────────────────────────────────
 * 路由守衛的責任分工
 * ──────────────────────────────────────────
 * - Store（這個檔案）：負責「儲存狀態 + 與 localStorage 同步」，不管權限邏輯
 * - Plugin：app 啟動時把 localStorage 讀進 store
 * - Middleware：每次導航時讀 store 判斷要不要放行
 *
 * 三者各司其職，store 不知道誰會用它，middleware 不用重寫 localStorage 邏輯。
 */

/** 使用者資訊（對應後端 AuthResponse，不含 token） */
export interface UserInfo {
  id: number;
  email: string;
  name: string | null;
  role: string;
  avatarUrl: string | null;
}

export const useAuthStore = defineStore('auth', () => {
  // 初始值都是 null，真正的值由 init() 從 localStorage 讀出來
  const token = ref<string | null>(null);
  const user = ref<UserInfo | null>(null);

  // 「是否已經從 localStorage 讀過」flag，防止 init() 重複執行
  const initialized = ref(false);

  const isLoggedIn = computed(() => !!token.value);
  const isAdmin = computed(() => user.value?.role === 'ADMIN');

  /** 文字頭像：name 首字 or email 首字，轉大寫（OAuth 使用者沒上傳頭像時的 fallback） */
  const avatarLetter = computed(() => {
    if (!user.value) return '';
    const src = user.value.name || user.value.email;
    return src.charAt(0).toUpperCase();
  });

  /**
   * 從 localStorage 還原登入狀態。
   * Client-side only（server 端沒有 localStorage），已執行過會直接 return。
   * 詳細呼叫時機見檔頭註解的「init() 由誰呼叫」段。
   */
  function init() {
    if (initialized.value || import.meta.server) return;
    token.value = localStorage.getItem('token');
    const raw = localStorage.getItem('user');
    if (raw) {
      try {
        user.value = JSON.parse(raw);
      } catch {
        // localStorage 的 JSON 格式壞掉（例如手動編輯），忽略當作未登入處理
      }
    }
    initialized.value = true;
  }

  /**
   * 登入成功後儲存 token + user。
   * 同時寫進 state 和 localStorage，兩邊保持同步。
   * 順便把 initialized 設為 true，避免後續 init() 誤把剛寫入的值讀成 null。
   */
  function setAuth(newToken: string, newUser: UserInfo) {
    token.value = newToken;
    user.value = newUser;
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    initialized.value = true;
  }

  /** 登出：同時清 state 和 localStorage */
  function logout() {
    token.value = null;
    user.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  return { token, user, initialized, isLoggedIn, isAdmin, avatarLetter, init, setAuth, logout };
});
