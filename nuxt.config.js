import fs from 'fs'
import path from 'path'

export default {
  mode: 'universal',
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
      { rel: 'apple-touch-icon', sizes: '180x180', href: './favicon/apple-touch-icon.png' },
      { rel: 'icon', type: 'image/png', sizes: '32x32', href: './favicon/favicon-32x32.png' },
      { rel: 'icon', type: 'image/png', sizes: '16x16', href: './favicon/favicon-16x16.png' },
      { rel: 'manifest', href: './favicon/site.webmanifest' },
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
    version: process.env.APP_VERSION ? {
      name: process.env.APP_VERSION,
      commit: process.env.APP_COMMIT,
      url: `https://github.com/zazuko/prefix-server/tree/${process.env.APP_COMMIT}`
    } : null
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
    '@nuxtjs/axios'
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
    }
  },
  hooks: {
    build: {
      async before (builder) {
        if (process.env.NODE_ENV !== 'production') {
          return
        }
        const debug = require('debug')('prefix-server')
        debug('preparing API data')
        const { prepareData } = require('./api/utils')
        const zlib = require('zlib')
        const extraFilePath = path.resolve(__dirname, './api/api-data.json.gz')
        const data = await prepareData()
        const gzip = zlib.gzipSync(JSON.stringify(data))
        fs.writeFileSync(extraFilePath, gzip)
        debug(`wrote API data to ${extraFilePath}`)
      }
    }
  },
  render: {
    etag: false
  }
}
