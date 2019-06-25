module.exports = {
  root: true,
  env: {
    browser: true,
    node: true,
    'cypress/globals': true
  },
  parserOptions: {
    parser: 'babel-eslint'
  },
  plugins: [
    'vue',
    'cypress'
  ],
  extends: [
    '@nuxtjs',
    'plugin:nuxt/recommended',
    'plugin:vue/strongly-recommended',
    'plugin:cypress/recommended',
    'standard'
  ],
  // add your custom rules here
  rules: {
    'no-console': 1,
    'vue/require-prop-types': 0,
    'vue/html-self-closing': 0,
    'vue/component-name-in-template-casing': ['error', 'kebab-case'],
    'vue/singleline-html-element-content-newline': 0,
    'vue/multiline-html-element-content-newline': 0,
    'vue/html-closing-bracket-newline': ['error', {
      singleline: 'never',
      multiline: 'never'
    }],
    // allow async-await
    'generator-star-spacing': 'off',
    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-lonely-if': 'error',
    quotes: ['error', 'single', { 'avoidEscape': true }],
    'callback-return': ['error', ['done', 'callback', 'cb', 'send']],
    'object-shorthand': 'error',
    'no-multi-spaces': ['error', { 'ignoreEOLComments': true }],
    'brace-style': ['error', 'stroustrup', { 'allowSingleLine': false }],
    'curly': ['error', 'all']
  }
}
