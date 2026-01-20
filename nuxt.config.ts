// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  ssr: true,
  modules: ['@vite-pwa/nuxt', '@nuxtjs/tailwindcss', '@nuxt/icon'],
  icon: {
    mode: 'css',
    cssLayer: 'base'
  },
  vite: {
    resolve: {
      alias: {
        '#types': '/types' 
      }
    }
  },
  pwa: {
    registerType: 'autoUpdate',
    manifest: {
      name: 'MDS_PWA',
      short_name: 'PWA',
      description: 'Tp du cours dev front end typé de mds',
      theme_color: '#ffffff',
      background_color: '#ffffff',
      lang: 'fr',
      start_url: '/',
      display: 'standalone',
      icons: [
        {
          src: 'icons/icon144-dev.png',
          sizes: '144x144',
          type: 'image/png'
        },
      ],
      screenshots: [
        {
          src:"screenshots/screenshot1452x1050.png",
          sizes:"1452x1050",
          form_factor:"wide"
        },
        {
          src:"screenshots/screenshot1452x1050.png",
          sizes:"1452x1050"
        }
      ]
    },
    workbox: {
      navigateFallback: '/',
    },
    devOptions: {
      enabled: true,
      type: "module", 
    }
  }
})