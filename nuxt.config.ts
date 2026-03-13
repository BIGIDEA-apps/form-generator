export default defineNuxtConfig({
  compatibilityDate: '2025-01-01',
  devtools: { enabled: true },

  imports: {
    dirs: ['composables', 'composables/**'],
  },

  modules: [
    '@nuxt/ui',
    '@pinia/nuxt',
    'nuxt-auth-utils',
  ],

  css: ['~/assets/css/main.css'],

  app: {
    head: {
      htmlAttrs: { dir: 'rtl', lang: 'he' },
      title: 'מחולל הטפסים של BIGIDEA',
      link: [
        { rel: 'icon', type: 'image/png', href: '/img/logos/bigidea-icon.png' },
      ],
    },
  },

  colorMode: {
    preference: 'light',
  },

  ui: {
    icons: ['heroicons'],
  },

  tailwindcss: {
    config: {
      theme: {
        extend: {
          colors: {
            bigidea: {
              50: '#e6f9ff',
              100: '#b3edff',
              200: '#80e1ff',
              300: '#4dd5ff',
              400: '#1ac9ff',
              500: '#00CDFF',
              600: '#00a4cc',
              700: '#007b99',
              800: '#005266',
              900: '#002933',
              950: '#001a22',
            },
          },
        },
      },
    },
  },

  runtimeConfig: {
    public: {
      formBaseUrl: process.env.PUBLIC_FORM_BASE_URL || '',
    },
    mongodbUri: process.env.MONGODB_URI || '',
    cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || '',
    cloudinaryApiKey: process.env.CLOUDINARY_API_KEY || '',
    cloudinaryApiSecret: process.env.CLOUDINARY_API_SECRET || '',
    cloudinaryFolder: process.env.CLOUDINARY_FOLDER || 'Form-Generator-Logos',
    oauth: {
      google: {
        clientId: process.env.NUXT_OAUTH_GOOGLE_CLIENT_ID || '',
        clientSecret: process.env.NUXT_OAUTH_GOOGLE_CLIENT_SECRET || '',
      },
    },
    session: {
      password: process.env.NUXT_SESSION_PASSWORD || '',
    },
  },

  routeRules: {
    '/admin/forms/**': { ssr: false },
  },

  nitro: {
    plugins: ['~/server/plugins/mongoose.ts'],
  },
})
