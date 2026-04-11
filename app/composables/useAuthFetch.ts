/**
 * useAuthFetch — 帶 JWT 的 $fetch wrapper
 *
 * 所有需要認證的 API 呼叫都走這個，它會自動從 auth store 讀 token，
 * 然後加到 Authorization header 裡。用 wrapper 的好處：
 *
 * 1. 不用每個 API 呼叫都手動塞 header
 * 2. token 的讀取位置集中在這裡，將來換成 cookie 或 refresh token 只改一處
 * 3. 如果 token 不存在就不加 header（後端會回 401，由頁面 middleware 處理）
 *
 * 注意：這不是 Nuxt 的 useFetch，只是普通的 function wrapper。
 * 因為我們的 API 都是使用者互動觸發的（client-side），不需要 SSR hydration。
 */
export function useAuthFetch<T>(url: string, opts?: Parameters<typeof $fetch>[1]) {
  const auth = useAuthStore();
  return $fetch<T>(url, {
    ...opts,
    headers: {
      ...opts?.headers,
      ...(auth.token ? { Authorization: `Bearer ${auth.token}` } : {}),
    },
  });
}
