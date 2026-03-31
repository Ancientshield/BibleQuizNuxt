// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxt/icon'],
  css: ['~/assets/scss/page-shell.scss'],
  app: {
    head: {
      link: [{ rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' }],
    },
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
    },
  },
});
