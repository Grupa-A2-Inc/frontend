import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/specs',

  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  timeout: 30_000,
  expect: {
    timeout: 10_000,
  },

  retries: 1,

  reporter: [
    ['list'],
    ['html', { outputFolder: 'html-report' }] 
  ],

});
