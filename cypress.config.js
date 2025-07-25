import { defineConfig } from 'cypress'
import { startDevServer } from '@cypress/vite-dev-server'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5174',
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/e2e.js',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true
  },
  component: {
    devServer: {
      framework: 'vanilla',
      bundler: 'vite',
    },
    setupNodeEvents(on, config) {
      on('dev-server:start', (options) => {
        return startDevServer({ options })
      })
    },
    specPattern: 'cypress/component/**/*.cy.{js,jsx,ts,tsx}',
    supportFile: 'cypress/support/component.js'
  }
})