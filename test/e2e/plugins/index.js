const browserify = require('@cypress/browserify-preprocessor')

// plugins file
module.exports = (on, config) => {
  const options = browserify.defaultOptions
  // print options to find babelify, it is inside transforms at index 1
  // and it is [filename, options]
  const babelOptions = options.browserifyOptions.transform[1][1]
  babelOptions.global = true
  // ignore all modules except the ones that are ES6
  babelOptions.ignore = [/\/node_modules\/(?!@nuxtjs\/)/]
  // if you want to see the final options
  // console.log('%o', babelOptions)

  on('file:preprocessor', browserify(options))

  return config
}
