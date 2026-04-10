import type { UserInfo } from '~/stores/auth';

/** 後端 /api/auth/login 與 /api/auth/register 回傳格式 */
export interface AuthResponse extends UserInfo {
  token: string;
}

/** 認證相關 API（登入、註冊、忘記密碼、重設密碼、驗證信、取得 profile） */
export const useAuthApi = () => {
  const login = (email: string, password: string) =>
    $fetch<AuthResponse>('/api/auth/login', { method: 'POST', body: { email, password } });

  const register = (email: string, password: string) =>
    $fetch<AuthResponse>('/api/auth/register', { method: 'POST', body: { email, password } });

  const forgotPassword = (email: string) => $fetch('/api/auth/forgot-password', { method: 'POST', body: { email } });

  const resetPassword = (token: string, password: string) =>
    $fetch('/api/auth/reset-password', { method: 'POST', body: { token, password } });

  const verifyEmail = (token: string) => $fetch('/api/auth/verify', { method: 'GET', params: { token } });

  const fetchProfile = (token: string) =>
    $fetch<UserInfo>('/api/auth/profile', { headers: { Authorization: `Bearer ${token}` } });

  return { login, register, forgotPassword, resetPassword, verifyEmail, fetchProfile };
};
