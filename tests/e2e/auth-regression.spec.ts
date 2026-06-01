// [Task: S3-QA-02] Regression Test cho Module Auth
import { test, expect } from '@playwright/test';

test.describe('Auth Module Regression Tests', () => {
  const VALID_USER = {
    email: 'regression_test@futurenext.ai',
    password: 'Password123!',
  };
  const INVALID_USER = {
    email: 'wrong@futurenext.ai',
    password: 'wrongpassword',
  };
  const NEW_USER_EMAIL = `newuser_${Date.now()}@futurenext.ai`;

  // =========================================================================
  // TC 1: ĐĂNG NHẬP THẤT BẠI
  // =========================================================================
  test('Should show error on invalid login', async ({ page }) => {
    await page.goto('/sign-in');

    await page.fill('input[name="email"]', INVALID_USER.email);
    await page.fill('input[name="password"]', INVALID_USER.password);
    await page.click('button[type="submit"]');

    const errorMessage = page.locator('text=Email hoặc mật khẩu không đúng');
    await expect(errorMessage).toBeVisible({ timeout: 5000 });
  });

  // =========================================================================
  // TC 2: ĐĂNG NHẬP THÀNH CÔNG VÀ ĐĂNG XUẤT
  // =========================================================================
  test('Should login successfully with valid credentials and logout', async ({ page }) => {
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', VALID_USER.email);
    await page.fill('input[name="password"]', VALID_USER.password);
    await page.click('button[type="submit"]');

    await page.waitForURL('**/');
    await expect(page.locator('button[aria-label="User menu"]')).toBeVisible();

    await page.click('button[aria-label="User menu"]');
    await page.click('button:has-text("Đăng xuất")');

    await expect(page.locator('text=Đăng nhập')).toBeVisible();
  });

  // =========================================================================
  // TC 3: ĐĂNG KÝ NGƯỜI DÙNG MỚI
  // =========================================================================
  test('Should register a new user successfully', async ({ page }) => {
    await page.goto('/sign-up');

    await page.fill('input[name="fullName"]', 'Regression Tester');
    await page.fill('input[name="email"]', NEW_USER_EMAIL);
    await page.fill('input[name="password"]', 'StrongPass123!');
    await page.fill('input[name="confirmPassword"]', 'StrongPass123!');

    const termsCheckbox = page.locator('input[type="checkbox"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    await page.click('button[type="submit"]');

    await expect(page).toHaveURL(/.*(sign-in|verify-email)/);
  });

  // =========================================================================
  // TC 4: QUÊN MẬT KHẨU
  // =========================================================================
  test('Should request password reset link successfully', async ({ page }) => {
    await page.goto('/forgot-password');

    await page.fill('input[name="email"]', VALID_USER.email);
    await page.click('button[type="submit"]');

    await expect(page.locator('text=vui lòng kiểm tra email')).toBeVisible({ timeout: 10000 });
  });
});
