import { defineConfig } from 'cypress'

export default defineConfig({
  projectId: 'x4nge2',
  videosFolder: 'cypress/videos',
  screenshotsFolder: 'cypress/screenshots',
  fixturesFolder: 'cypress/fixtures',
  // if video is set to true, it records videos of test runs
  video: false,
  e2e: {
    // We've imported your old cypress plugins here.
    // You may want to clean this up later by importing these.
    setupNodeEvents(on, config) {
      // Set up the code coverage task to capture coverage data
//       require('@cypress/code-coverage/task')(on, config)

      // Import custom plugins (if any)
      return require('./cypress/plugins/index.ts').default(on, config)
    },
    baseUrl: 'http://localhost:4200',
  },
})
