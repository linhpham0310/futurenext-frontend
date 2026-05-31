// [Task: S3-QA-01] Kịch bản End-to-End Testing cho Teacher Workflow
import { test, expect } from '@playwright/test';

// Định nghĩa thông tin tài khoản test
const USER_CREDENTIALS = {
  email: `testteacher_${Date.now()}@futurenext.ai`, // ✅ Email unique
  password: 'Test@123456',
  fullName: 'Test Teacher',
};

const ADMIN_CREDENTIALS = {
  email: 'admin@futurenext.com',
  password: 'Admin@123456',
};

// Tăng timeout cho toàn bộ test
test.describe.configure({ timeout: 120000 });

test.describe.serial('Teacher Workflow E2E', () => {
  // TC 1: USER ĐĂNG KÝ TÀI KHOẢN VÀ NỘP HỒ SƠ
  test('User can register and submit teacher profile', async ({ page }) => {
    // Tăng timeout riêng cho test này
    test.setTimeout(120000);

    // 1. Đăng ký tài khoản mới
    await page.goto('/sign-up');

    // Đợi form load
    await page.waitForSelector('form', { timeout: 10000 });

    // Điền thông tin đăng ký (cập nhật selector theo UI thực tế)
    await page.fill(
      'input[name="fullName"], input[placeholder*="họ tên"]',
      USER_CREDENTIALS.fullName
    );
    await page.fill('input[name="email"], input[placeholder*="email"]', USER_CREDENTIALS.email);
    await page.fill(
      'input[name="password"], input[placeholder*="mật khẩu"]',
      USER_CREDENTIALS.password
    );
    await page.fill(
      'input[name="confirmPassword"], input[placeholder*="xác nhận"]',
      USER_CREDENTIALS.password
    );

    // Checkbox đồng ý - thử nhiều selector
    const checkbox = page.locator('input[type="checkbox"], button[role="checkbox"]').first();
    await checkbox.check();

    // Click nút đăng ký
    await page.click('button[type="submit"], button:has-text("Đăng ký")');

    // Đợi thông báo hoặc redirect
    await page.waitForTimeout(2000);

    // 2. Đăng nhập
    await page.goto('/sign-in');
    await page.fill('input[placeholder*="email"]', USER_CREDENTIALS.email);
    await page.fill('input[placeholder*="mật khẩu"]', USER_CREDENTIALS.password);
    await page.click('button[type="submit"]');

    // Đợi redirect về trang chủ
    await page.waitForURL('**/', { timeout: 30000 });

    // 3. Vào trang Profile
    await page.goto('/profile');
    await page.waitForLoadState('networkidle');

    // 4. Điền form đăng ký giảng viên
    await page.fill(
      'textarea',
      'Tôi là chuyên gia lập trình NextJS với 5 năm kinh nghiệm giảng dạy tại các trung tâm lớn.'
    );
    await page.fill(
      'input[placeholder*="chuyên môn"], input[placeholder*="JavaScript"]',
      'NextJS, React, TypeScript, NodeJS'
    );

    // Click nút nộp hồ sơ
    await page.click('button:has-text("Nộp hồ sơ"), button:has-text("Đăng ký giảng viên")');

    // Kiểm tra thông báo thành công
    await expect(page.locator('text=Nộp hồ sơ thành công')).toBeVisible({ timeout: 10000 });

    // Đăng xuất
    await page.click('button:has-text("Đăng xuất")');
  });

  // TC 2: ADMIN DUYỆT HỒ SƠ
  test('Admin can review and approve teacher profile', async ({ page }) => {
    test.setTimeout(60000);

    // Admin đăng nhập
    await page.goto('/sign-in');
    await page.fill('input[placeholder*="email"]', ADMIN_CREDENTIALS.email);
    await page.fill('input[placeholder*="mật khẩu"]', ADMIN_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Vào trang quản lý hồ sơ giáo viên
    await page.goto('/admin/teacher-profiles');
    await page.waitForLoadState('networkidle');

    // Tìm hồ sơ của user vừa đăng ký
    const row = page.locator(`tr:has-text("${USER_CREDENTIALS.email}")`);
    await expect(row).toBeVisible({ timeout: 10000 });

    // Bấm nút duyệt
    const approveBtn = row.locator('button:has-text("Duyệt"), button:has-text("APPROVE")');
    await approveBtn.click();

    // Kiểm tra trạng thái chuyển thành APPROVED
    await expect(row.locator('text=APPROVED')).toBeVisible({ timeout: 10000 });

    // Đăng xuất
    await page.click('button:has-text("Đăng xuất")');
  });

  // TC 3: USER NHẬN QUYỀN GIẢNG VIÊN
  test('User receives Teacher role and accesses dashboard', async ({ page }) => {
    test.setTimeout(60000);

    // User đăng nhập lại
    await page.goto('/sign-in');
    await page.fill('input[placeholder*="email"]', USER_CREDENTIALS.email);
    await page.fill('input[placeholder*="mật khẩu"]', USER_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('**/');

    // Kiểm tra badge Giảng viên
    await page.click('button[aria-label="User menu"], .avatar-button');
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
