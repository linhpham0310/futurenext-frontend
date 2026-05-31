// [Task: S3-QA-01] Kịch bản End-to-End Testing cho Teacher Workflow
import { test, expect } from '@playwright/test';

// Định nghĩa thông tin tài khoản test
const USER_CREDENTIALS = {
  email: `testteacher_${Date.now()}@futurenext.ai`,
  password: 'Test@123456',
  fullName: 'Test Teacher',
};

const ADMIN_CREDENTIALS = {
  email: 'admin@futurenext.com',
  password: 'Admin@123456',
};

// Tăng timeout cho toàn bộ test
test.use({
  actionTimeout: 30000,
  navigationTimeout: 60000,
});

test.describe.configure({ timeout: 120000 });

test.describe.serial('Teacher Workflow E2E', () => {
  // TC 1: USER ĐĂNG KÝ TÀI KHOẢN VÀ NỘP HỒ SƠ
  test('User can register and submit teacher profile', async ({ page }) => {
    test.setTimeout(120000);

    // 1. Đăng ký tài khoản mới
    await page.goto('/sign-up');
    await page.waitForLoadState('networkidle');

    // Điền thông tin
    await page
      .locator('input[type="text"], input[name="fullName"]')
      .first()
      .fill(USER_CREDENTIALS.fullName);
    await page
      .locator('input[type="email"], input[name="email"]')
      .first()
      .fill(USER_CREDENTIALS.email);
    await page.locator('input[type="password"]').nth(0).fill(USER_CREDENTIALS.password);
    await page.locator('input[type="password"]').nth(1).fill(USER_CREDENTIALS.password);

    // Checkbox - click vào label
    await page.locator('label:has-text("đồng ý"), label:has-text("điều khoản")').click();

    // Submit
    await page.locator('button[type="submit"]').click();
    await page.waitForTimeout(2000);

    // 2. Đăng nhập
    await page.goto('/sign-in');
    await page.locator('input[type="email"]').fill(USER_CREDENTIALS.email);
    await page.locator('input[type="password"]').fill(USER_CREDENTIALS.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/');

    // 3. Vào Profile
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // 4. Nộp hồ sơ giảng viên
    await page
      .locator('textarea')
      .fill('Tôi là chuyên gia lập trình NextJS với 5 năm kinh nghiệm giảng dạy.');
    await page
      .locator('input[placeholder*="chuyên môn"], input[placeholder*="expertise"]')
      .fill('NextJS, React, TypeScript');
    await page.locator('button:has-text("Nộp hồ sơ")').click();

    // Kiểm tra thành công
    await expect(page.locator('text=Nộp hồ sơ thành công')).toBeVisible({ timeout: 10000 });

    // Đăng xuất
    await page.locator('button:has-text("Đăng xuất")').click();
  });

  // TC 2: ADMIN DUYỆT HỒ SƠ
  test('Admin can review and approve teacher profile', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('/sign-in');
    await page.locator('input[type="email"]').fill(ADMIN_CREDENTIALS.email);
    await page.locator('input[type="password"]').fill(ADMIN_CREDENTIALS.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/');

    await page.goto('/admin/teacher-profiles');
    await page.waitForLoadState('networkidle');

    const row = page.locator(`tr:has-text("${USER_CREDENTIALS.email}")`);
    await expect(row).toBeVisible({ timeout: 10000 });
    await row.locator('button:has-text("Duyệt")').click();
    await expect(row.locator('text=APPROVED')).toBeVisible({ timeout: 10000 });

    await page.locator('button:has-text("Đăng xuất")').click();
  });

  // TC 3: USER NHẬN QUYỀN GIẢNG VIÊN
  test('User receives Teacher role and accesses dashboard', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('/sign-in');
    await page.locator('input[type="email"]').fill(USER_CREDENTIALS.email);
    await page.locator('input[type="password"]').fill(USER_CREDENTIALS.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL('**/');

    await page.goto('/teacher/dashboard');
    await expect(page.locator('h1:has-text("Bảng điều khiển giảng viên")')).toBeVisible({
      timeout: 10000,
    });
  });
});
