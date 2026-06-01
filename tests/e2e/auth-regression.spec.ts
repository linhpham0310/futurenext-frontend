// [Task: S3-QA-02] Kịch bản Kiểm thử hồi quy (Regression Test) cho Module Auth
import { test, expect } from '@playwright/test';

test.describe('Auth Module Regression Tests', () => {
  // Dữ liệu dùng chung cho các test cases
  const VALID_USER = { email: 'regression_test@futurenext.ai', password: 'Password123!' };
  const INVALID_USER = { email: 'wrong@futurenext.ai', password: 'wrongpassword' };
  // Dùng Date.now() để tạo email duy nhất mỗi lần test đăng ký
  const NEW_USER_EMAIL = `newuser_${Date.now()}@futurenext.ai`;

  // =========================================================================
  // TC 1: KIỂM TRA LUỒNG ĐĂNG NHẬP (LOGIN FLOW)
  // =========================================================================
  test('Should show error on invalid login', async ({ page }) => {
    await page.goto('/login');

    // Điền sai thông tin
    await page.fill('input[name="email"]', INVALID_USER.email);
    await page.fill('input[name="password"]', INVALID_USER.password);
    await page.click('button[type="submit"]');

    // [Task: S3-QA-02] Xác nhận hệ thống chặn đăng nhập và hiện lỗi (Tham chiếu text thông báo lỗi từ FE của bạn)
    const errorMessage = page.locator('text=Email hoặc mật khẩu không chính xác');
    await expect(errorMessage).toBeVisible();
  });

  test('Should login successfully with valid credentials and logout', async ({ page }) => {
    // 1. Đăng nhập
    await page.goto('/login');
    await page.fill('input[name="email"]', VALID_USER.email);
    await page.fill('input[name="password"]', VALID_USER.password);
    await page.click('button[type="submit"]');

    // Đợi URL thay đổi về trang chủ
    await page.waitForURL('/');

    // Kiểm tra UI có hiện Header của User đã đăng nhập không
    await expect(page.locator('button.flex.items-center')).toBeVisible(); // Nút mở dropdown user

    // 2. Đăng xuất
    await page.click('button.flex.items-center'); // Mở dropdown
    await page.click('button:has-text("Đăng xuất")');

    // Xác nhận đã bị văng ra trang Login hoặc Trang chủ public
    await expect(page.locator('a:has-text("Đăng nhập")')).toBeVisible();
  });

  // =========================================================================
  // TC 2: KIỂM TRA LUỒNG ĐĂNG KÝ (REGISTER FLOW)
  // =========================================================================
  test('Should register a new user successfully', async ({ page }) => {
    await page.goto('/register');

    await page.fill('input[name="full_name"]', 'Regression Tester');
    await page.fill('input[name="email"]', NEW_USER_EMAIL);
    await page.fill('input[name="password"]', 'StrongPass123!');
    await page.fill('input[name="confirm_password"]', 'StrongPass123!');

    // Tích chọn điều khoản (nếu có)
    const termsCheckbox = page.locator('input[type="checkbox"][name="terms"]');
    if (await termsCheckbox.isVisible()) {
      await termsCheckbox.check();
    }

    await page.click('button[type="submit"]');

    // [Task: S3-QA-02] Chuyển hướng thành công. Tùy logic dự án, có thể là trang xác minh OTP hoặc Login
    await expect(page).toHaveURL(/.*(login|verify-email)/);
  });

  // =========================================================================
  // TC 3: KIỂM TRA LUỒNG QUÊN MẬT KHẨU (FORGOT PASSWORD FLOW)
  // =========================================================================
  test('Should request password reset link successfully', async ({ page }) => {
    await page.goto('/forgot-password');

    // Nhập email hợp lệ
    await page.fill('input[name="email"]', VALID_USER.email);
    await page.click('button[type="submit"]');

    // [Task: S3-QA-02] Kiểm tra thông báo hướng dẫn check mail
    await expect(page.locator('text=vui lòng kiểm tra email')).toBeVisible({ timeout: 10000 });
  });
});
