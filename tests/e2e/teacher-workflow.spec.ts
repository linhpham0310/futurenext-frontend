// tests/teacher-workflow.spec.ts
import { test, expect } from '@playwright/test';

const USER_CREDENTIALS = {
  email: 'testteacher@futurenext.ai',
  password: 'Test@123456',
  fullName: 'Test Teacher',
};

const ADMIN_CREDENTIALS = {
  email: 'admin@test.com',
  password: 'admin123',
};

test.describe.serial('Teacher Workflow E2E', () => {
  test('User can submit teacher profile', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', USER_CREDENTIALS.email);
    await page.fill('input[name="password"]', USER_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Form nộp hồ sơ giảng viên (có thể nằm trong tab hoặc section)
    const bioTextarea = page.locator('textarea[placeholder*="tiểu sử"], textarea[name="bio"]');
    await expect(bioTextarea).toBeVisible();
    await bioTextarea.fill('Tôi là chuyên gia lập trình NextJS với 5 năm kinh nghiệm giảng dạy.');

    const expertiseInput = page.locator(
      'input[placeholder*="chuyên môn"], input[name="expertise"]'
    );
    if (await expertiseInput.isVisible()) {
      await expertiseInput.fill('NextJS, React, TypeScript, NodeJS');
    }

    const submitBtn = page.locator('button:has-text("Nộp hồ sơ")');
    await submitBtn.click();

    await expect(page.locator('text=Nộp hồ sơ thành công')).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Đang chờ duyệt')).toBeVisible();

    await page.click('button[aria-label="User menu"]');
    await page.click('button:has-text("Đăng xuất")');
  });

  test('User can update teacher profile while pending', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', USER_CREDENTIALS.email);
    await page.fill('input[name="password"]', USER_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    const bioTextarea = page.locator('textarea[placeholder*="tiểu sử"], textarea[name="bio"]');
    await bioTextarea.fill('[CẬP NHẬT] Tôi là chuyên gia lập trình với 6 năm kinh nghiệm.');
    await page.click('button:has-text("Cập nhật hồ sơ")');

    await expect(page.locator('text=Cập nhật hồ sơ thành công')).toBeVisible({ timeout: 10000 });

    await page.click('button[aria-label="User menu"]');
    await page.click('button:has-text("Đăng xuất")');
  });

  test('Admin can review and approve teacher profile', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', ADMIN_CREDENTIALS.email);
    await page.fill('input[name="password"]', ADMIN_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard');

    await page.goto('/admin/teacher-profiles');
    await page.waitForLoadState('networkidle');

    const row = page.locator(`tr:has-text("${USER_CREDENTIALS.email}")`);
    await expect(row).toBeVisible({ timeout: 10000 });
    await expect(row.locator('text=pending_review')).toBeVisible();

    await row.locator('button:has-text("Duyệt")').click();

    await expect(row.locator('text=approved')).toBeVisible({ timeout: 10000 });

    await page.click('button[aria-label="User menu"]');
    await page.click('button:has-text("Đăng xuất")');
  });

  test('User receives Teacher role and accesses dashboard', async ({ page }) => {
    test.setTimeout(60000);
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', USER_CREDENTIALS.email);
    await page.fill('input[name="password"]', USER_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/dashboard');

    // Kiểm tra menu user hiển thị vai trò
    await page.click('button[aria-label="User menu"]');
    await expect(page.locator('text=Giảng viên')).toBeVisible({ timeout: 5000 });
    await page.keyboard.press('Escape');

    await page.goto('/teacher/dashboard');
    await expect(page.locator('h1:has-text("Bảng điều khiển giảng viên")')).toBeVisible({
      timeout: 10000,
    });

    await page.goto('/profile');
    await expect(page.locator('text=Đăng ký trở thành Giảng viên')).toBeHidden();
  });
});
