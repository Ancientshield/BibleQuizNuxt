/**
 * 帶 JWT token 的 $fetch wrapper — 所有需要認證的 API 呼叫都用這個。
 * 自動從 auth store 取 token 放進 Authorization header。
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
