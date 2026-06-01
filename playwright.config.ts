import { defineConfig, devices } from '@playwright/test';

// [Task: S3-QA-02] Đọc cấu hình URL từ biến môi trường.
// Nếu không truyền, mặc định sẽ chạy ở Localhost (dành cho Dev).
const baseURL = process.env.BASE_URL || 'http://localhost:3000';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  use: {
    // [Task: S3-QA-02] Gán baseURL động vào Playwright
    baseURL: baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure', // Tự động chụp ảnh màn hình nếu test rớt
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Bạn có thể mở comment firefox, webkit nếu cần test đa trình duyệt
  ],
});
