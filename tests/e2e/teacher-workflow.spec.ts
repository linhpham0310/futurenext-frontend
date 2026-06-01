// [Task: S3-QA-01] Kịch bản End-to-End Testing cho Teacher Workflow
import { test, expect } from '@playwright/test';

// Định nghĩa thông tin tài khoản test - dùng tài khoản đã có sẵn
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
  // =========================================================================
  // TC 1: USER NỘP HỒ SƠ GIẢNG VIÊN
  // =========================================================================
  test('User can submit teacher profile', async ({ page }) => {
    test.setTimeout(60000);

    // 1. Đăng nhập
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', USER_CREDENTIALS.email);
    await page.fill('input[name="password"]', USER_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // 2. Vào trang Profile
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // 3. Điền form đăng ký giảng viên
    await page.fill(
      'textarea',
      'Tôi là chuyên gia lập trình NextJS với 5 năm kinh nghiệm giảng dạy tại các trung tâm lớn.'
    );
    await page.fill('input[placeholder*="chuyên môn"]', 'NextJS, React, TypeScript, NodeJS');

    // 4. Nộp hồ sơ
    await page.click('button:has-text("Nộp hồ sơ")');

    // 5. Kiểm tra thông báo thành công
    await expect(page.locator('text=Nộp hồ sơ thành công')).toBeVisible({ timeout: 10000 });

    // 6. Kiểm tra trạng thái PENDING
    await expect(page.locator('text=Đang chờ duyệt')).toBeVisible();

    // 7. Đăng xuất
    await page.click('button:has-text("Đăng xuất")');
  });

  // =========================================================================
  // TC 2: USER CẬP NHẬT HỒ SƠ (KHI ĐANG PENDING)
  // =========================================================================
  test('User can update teacher profile while pending', async ({ page }) => {
    test.setTimeout(60000);

    await page.goto('/sign-in');
    await page.fill('input[name="email"]', USER_CREDENTIALS.email);
    await page.fill('input[name="password"]', USER_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // Cập nhật bio
    await page.fill('textarea', '[CẬP NHẬT] Tôi là chuyên gia lập trình với 6 năm kinh nghiệm.');
    await page.click('button:has-text("Cập nhật hồ sơ")');

    await expect(page.locator('text=Cập nhật hồ sơ thành công')).toBeVisible({ timeout: 10000 });

    await page.click('button:has-text("Đăng xuất")');
  });

  // =========================================================================
  // TC 3: ADMIN DUYỆT HỒ SƠ
  // =========================================================================
  test('Admin can review and approve teacher profile', async ({ page }) => {
    test.setTimeout(60000);

    // Admin đăng nhập
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', ADMIN_CREDENTIALS.email);
    await page.fill('input[name="password"]', ADMIN_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Vào trang quản lý hồ sơ
    await page.goto('/admin/teacher-profiles');
    await page.waitForLoadState('networkidle');

    // Tìm hồ sơ của user
    const row = page.locator(`tr:has-text("${USER_CREDENTIALS.email}")`);
    await expect(row).toBeVisible({ timeout: 10000 });

    // Kiểm tra trạng thái PENDING
    await expect(row.locator('text=PENDING')).toBeVisible();

    // Bấm nút Duyệt
    await row.locator('button:has-text("Duyệt")').click();

    // Kiểm tra trạng thái APPROVED
    await expect(row.locator('text=APPROVED')).toBeVisible({ timeout: 10000 });

    // Đăng xuất
    await page.click('button:has-text("Đăng xuất")');
  });

  // =========================================================================
  // TC 4: USER NHẬN QUYỀN GIẢNG VIÊN
  // =========================================================================
  test('User receives Teacher role and accesses dashboard', async ({ page }) => {
    test.setTimeout(60000);

    // User đăng nhập lại
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', USER_CREDENTIALS.email);
    await page.fill('input[name="password"]', USER_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Kiểm tra badge Giảng viên
    await page.click('button[aria-label="User menu"]');
    await expect(page.locator('text=Giảng viên')).toBeVisible({ timeout: 5000 });

    // Truy cập Teacher Dashboard
    await page.goto('/teacher/dashboard');
    await expect(page.locator('h1:has-text("Bảng điều khiển giảng viên")')).toBeVisible({
      timeout: 10000,
    });

    // Vào Profile kiểm tra không còn form đăng ký
    await page.goto('/profile');
    await expect(page.locator('text=Đăng ký trở thành Giảng viên')).toBeHidden();
  });
});
