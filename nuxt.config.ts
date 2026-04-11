// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxt/icon'],
  css: ['~/assets/scss/main.scss', '~/assets/scss/_animations.scss'],
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "~/assets/scss/variables" as *;',
        },
      },
    },
  },
  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
  },
  // OAuth callback 是純 client-side 一次性跳板，不能讓 SSG 預渲染，
  // 否則 /oauth/callback（無斜線 canonical）跟 /oauth/callback/（實際 URL）
  // 會 hydration mismatch 讓 onMounted 不觸發。
  routeRules: {
    '/oauth/callback': { prerender: false, ssr: false },
    '/oauth/callback/': { prerender: false, ssr: false },
  },
  nitro: {
    devProxy: {
      '/api/auth': {
        target: 'http://localhost:8080/api/auth',
        changeOrigin: true,
      },
      '/api/biblequiz': {
        target: 'http://localhost:8080/api/biblequiz',
        changeOrigin: true,
      },
      '/api/questions': {
        target: 'http://localhost:8080/api/questions',
        changeOrigin: true,
      },
      '/api/admin': {
        target: 'http://localhost:8080/api/admin',
        changeOrigin: true,
      },
      '/api/user': {
        target: 'http://localhost:8080/api/user',
        changeOrigin: true,
      },
      '/oauth2': {
        target: 'http://localhost:8080/oauth2',
        changeOrigin: true,
      },
      '/login/oauth2': {
        target: 'http://localhost:8080/login/oauth2',
        changeOrigin: true,
      },
    },
  },
});
