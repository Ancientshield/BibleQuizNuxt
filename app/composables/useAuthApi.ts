import type { UserInfo } from '~/stores/auth';

/**
 * useAuthApi — 認證相關 API 集中處
 *
 * 把所有 /api/auth/* 的呼叫集中在這裡，避免 endpoint URL 散落在各個頁面。
 * 好處：將來改 API 路徑、加統一 error handling、換 base URL 都只改一個地方。
 *
 * 這裡全部用 `$fetch` 而非 `useAuthFetch`，因為認證相關 API 本身就是
 * 用來「取得 token」的，呼叫時還沒登入，不需要帶 Authorization header。
 * 唯一例外是 fetchProfile，它要帶 token 去驗身分取 profile（OAuth callback 用）。
 */

/** 後端 /api/auth/login 與 /api/auth/register 的回傳格式（UserInfo + token） */
export interface AuthResponse extends UserInfo {
  token: string;
}

export const useAuthApi = () => {
  // ── 登入 ──
  // 成功回傳 token + UserInfo；失敗（密碼錯、未驗證）會 throw fetch error
  const login = (email: string, password: string) =>
    $fetch<AuthResponse>('/api/auth/login', { method: 'POST', body: { email, password } });

  // ── 註冊 ──
  // 註冊成功後後端會寄驗證信，此時回傳的 token 為 null（要驗證完 email 才能登入）
  const register = (email: string, password: string) =>
    $fetch<AuthResponse>('/api/auth/register', { method: 'POST', body: { email, password } });

  // ── 忘記密碼 ──
  // 後端寄「重設密碼連結」到信箱。為防濫發，後端有 60 秒冷卻機制
  const forgotPassword = (email: string) => $fetch('/api/auth/forgot-password', { method: 'POST', body: { email } });

  // ── 重設密碼 ──
  // token 來自信件連結的 query string，前端 reset-password.vue 從 URL 取出
  const resetPassword = (token: string, password: string) =>
    $fetch('/api/auth/reset-password', { method: 'POST', body: { token, password } });

  // ── 驗證 Email ──
  // token 來自驗證信連結；後端成功後把 user.email_verified 設為 true
  const verifyEmail = (token: string) => $fetch('/api/auth/verify', { method: 'GET', params: { token } });

  // ── 取得 profile（OAuth callback 專用） ──
  // OAuth 登入後後端只給 token 而沒給 user 資料，要用這支 API 補拿 UserInfo
  // 所以必須手動帶 Bearer token（這時 auth store 還沒 setAuth）
  const fetchProfile = (token: string) =>
    $fetch<UserInfo>('/api/auth/profile', { headers: { Authorization: `Bearer ${token}` } });

  return { login, register, forgotPassword, resetPassword, verifyEmail, fetchProfile };
};
