import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    specPattern: 'test/e2e/integration/**/*_spec.js',
    supportFile: 'test/e2e/support/index.js',
    fixturesFolder: 'test/e2e/fixtures',
    screenshotsFolder: 'test/e2e/screenshots',
    videosFolder: 'test/e2e/videos'
  }
})
