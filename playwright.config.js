const { defineConfig } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './e2e',
  timeout: 30000,
  expect: {
    timeout: 7000,
  },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'playwright-report/results.json' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    channel: 'chrome',
    headless: true,
    viewport: { width: 1280, height: 800 },
    screenshot: 'only-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 15000,
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: {
        channel: 'chrome',
        viewport: { width: 1280, height: 800 },
      },
    },
    {
      name: 'Mobile Viewport',
      use: {
        channel: 'chrome',
        viewport: { width: 375, height: 667 },
      },
    },
  ],
});
