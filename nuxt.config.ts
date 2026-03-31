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
      '/api': {
        target: 'http://localhost:8080/api',
        changeOrigin: true,
      },
    },
  },
});
