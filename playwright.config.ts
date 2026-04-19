import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 600000, // 10分钟
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [
    // Playwright官方HTML报告
    ['html', { outputFolder: 'playwright-report' }],
    // JSON报告（用于自定义报告生成）
    ['json', { outputFile: 'playwright-report/results.json' }],
    // 控制台输出
    ['list'],
  ],
  use: {
    channel: 'chrome',
    headless: false,
    viewport: { width: 1280, height: 720 },
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});