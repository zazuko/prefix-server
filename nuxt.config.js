export default {
  /*
  ** Headers of the page
  */
  head: {
    titleTemplate: '%s - Zazuko Prefix Server',
    title: 'Zazuko Prefix Server',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { name: 'msapplication-TileColor', content: '#ffb15e' },
      { nane: 'theme-color', content: '#ffb15e' },
      { hid: 'description', name: 'description', content: process.env.npm_package_description || '' }
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
        href: 'opensearch.xml',
        title: 'Zazuko Prefix Server'
      }
    ]
  },
  env: {
    version: process.env.APP_VERSION
      ? {
          name: process.env.APP_VERSION,
          commit: process.env.APP_COMMIT,
          url: `https://github.com/zazuko/prefix-server/tree/${process.env.APP_COMMIT}`
        }
      : null
  },
  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#ff441c' },
  /*
  ** Global CSS
  */
  css: [
    '@/assets/zazuko/main.scss'
  ],
  serverMiddleware: [
    '@/api/etag-middleware',
    '@/api/'
  ],
  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '@/plugins/clipboard'
  ],
  /*
  ** Nuxt.js modules
  */
  modules: [
    '@nuxtjs/axios',
    // `/api/v1/health` on the main port (first middleware) and on a dedicated port (worker thread)
    '~/modules/health'
  ],
  /*
  ** Axios module configuration
  ** See https://axios.nuxtjs.org/options
  */
  axios: {
  },
  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
    },
    transpile: [
      'feather-icon-literals',
      // ESM-only packages using syntax webpack 4 cannot parse
      'query-string',
      'filter-obj',
      'split-on-first',
      'decode-uri-component'
    ],
    babel: {
      plugins: [
        // webpack 4 cannot parse logical assignment operators (`??=`, `||=`, `&&=`) and
        // the server build targets the current node version, so babel must transpile them.
        // Nuxt's preset already takes care of `?.` and `??` for the server build.
        '@babel/plugin-transform-logical-assignment-operators'
      ]
    },
    loaders: {
      scss: {
        sassOptions: {
          // sass-loader 10 (the last one for webpack 4) only supports the legacy sass JS API
          silenceDeprecations: ['legacy-js-api', 'import']
        }
      }
    }
  },
  hooks: {
    build: {}
  },
  render: {
    etag: false
  }
}
