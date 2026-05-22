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
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#020617' },
      ],
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
