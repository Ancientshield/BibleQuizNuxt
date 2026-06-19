// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  modules: ['@nuxtjs/tailwindcss', '@pinia/nuxt', '@nuxt/icon'],
  vue: {
    compilerOptions: {
      isCustomElement: tag => tag === 'chat-bubble-snippet',
    },
  },
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
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/favicon.svg' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Noto+Serif+TC:wght@400;600;700;900&display=swap',
        },
      ],
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1, viewport-fit=cover' },
        { name: 'theme-color', content: '#FAF7F2' },
      ],
    },
  },
  runtimeConfig: {
    public: {
      cfAiSearchUrl: process.env.NUXT_PUBLIC_CF_AI_SEARCH_URL || '',
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
