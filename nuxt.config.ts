import pkg from './package.json'

export default defineNuxtConfig({
  modules: ['@nuxt/eslint'],
  devtools: { enabled: true },

  app: {
    head: {
      titleTemplate: '%s - Zazuko Prefix Server',
      title: 'Zazuko Prefix Server',
      meta: [
        { name: 'msapplication-TileColor', content: '#ffb15e' },
        { name: 'theme-color', content: '#ffb15e' },
        { name: 'description', content: pkg.description }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon/favicon.ico' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/favicon/apple-touch-icon.png' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon/favicon-32x32.png' },
        { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon/favicon-16x16.png' },
        { rel: 'manifest', href: '/favicon/site.webmanifest' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css?family=Playfair+Display:400,700|Roboto:300,400,500,700|Material+Icons'
        },
        {
          rel: 'search',
          type: 'application/opensearchdescription+xml',
          href: '/opensearch.xml',
          title: 'Zazuko Prefix Server'
        }
      ]
    }
  },

  css: ['~/assets/zazuko/main.scss'],

  runtimeConfig: {
    public: {
      // base URL shown in the API examples; `API_URL_BROWSER` at build time,
      // `NUXT_PUBLIC_API_BASE` at runtime, the request origin otherwise
      apiBase: process.env.API_URL_BROWSER || '',
      version: process.env.APP_VERSION
        ? {
            name: process.env.APP_VERSION,
            commit: process.env.APP_COMMIT || '',
            url: `https://github.com/zazuko/prefix-server/tree/${process.env.APP_COMMIT || ''}`
          }
        : null
    }
  },

  build: {
    transpile: ['feather-icon-literals']
  },

  routeRules: {
    // for backward compatibility
    '/namespaces': { redirect: { to: '/prefixes', statusCode: 302 } }
  },
  compatibilityDate: '2026-08-25',

  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          silenceDeprecations: ['import']
        }
      }
    }
  },

  eslint: {
    config: {
      stylistic: {
        indent: 2,
        quotes: 'single',
        semi: false,
        commaDangle: 'never',
        braceStyle: 'stroustrup',
        arrowParens: false,
        quoteProps: 'as-needed'
      }
    }
  }
})
