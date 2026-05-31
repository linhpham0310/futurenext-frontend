// [Task: S3-QA-01] Kịch bản End-to-End Testing cho Teacher Workflow
import { test, expect } from '@playwright/test';

// Định nghĩa thông tin tài khoản test
const USER_CREDENTIALS = {
  email: 'testteacher@futurenext.ai',
  password: 'Test@123456',
  fullName: 'Test Teacher',
};

const ADMIN_CREDENTIALS = {
  email: 'admin@futurenext.com',
  password: 'Admin@123456',
};

// Chạy tuần tự các test case vì chúng phụ thuộc dữ liệu của nhau
test.describe.serial('Teacher Workflow E2E', () => {
  test.describe.configure({ timeout: 12000000 });
  // =========================================================================
  // TC 1: USER ĐĂNG KÝ TÀI KHOẢN VÀ NỘP HỒ SƠ
  // =========================================================================
  test('User can register and submit teacher profile', async ({ page }) => {
    // 1. Đăng ký tài khoản mới (nếu chưa có)
    await page.goto('/sign-up');

    await page.fill('input[name="fullName"]', USER_CREDENTIALS.fullName);
    await page.fill('input[name="email"]', USER_CREDENTIALS.email);
    await page.fill('input[name="password"]', USER_CREDENTIALS.password);
    await page.fill('input[name="confirmPassword"]', USER_CREDENTIALS.password);
    await page.check('input[name="agreeTerms"]');
    await page.click('button[type="submit"]');

    // Đợi thông báo đăng ký thành công
    await expect(page.locator('text=Đăng ký thành công')).toBeVisible({ timeout: 10000 });

    // 2. Đăng nhập (sau khi đăng ký)
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', USER_CREDENTIALS.email);
    await page.fill('input[name="password"]', USER_CREDENTIALS.password);
    await page.click('button[type="submit"]');

    // Đợi chuyển hướng về trang chủ
    await page.waitForURL('/');

    // 3. Điều hướng vào trang Profile
    await page.goto('/profile');

    // 4. Điền Form đăng ký giảng viên
    await page.fill(
      'textarea[placeholder*="tiểu sử"]',
      'Tôi là chuyên gia lập trình NextJS với 5 năm kinh nghiệm giảng dạy tại các trung tâm lớn.'
    );
    await page.fill('input[placeholder*="JavaScript"]', 'NextJS, React, TypeScript, NodeJS');

    // Bấm nút Submit
    await page.click('button:has-text("Nộp hồ sơ")');

    // Kiểm tra thông báo thành công
    await expect(page.locator('text=Nộp hồ sơ thành công')).toBeVisible({ timeout: 10000 });

    // Kiểm tra trạng thái hồ sơ chuyển sang PENDING
    await expect(page.locator('text=Đang chờ duyệt')).toBeVisible();

    // 5. Test chức năng Update khi đang PENDING
    await page.fill(
      'textarea[placeholder*="tiểu sử"]',
      '[CẬP NHẬT] Tôi là chuyên gia lập trình NextJS với 5 năm kinh nghiệm và đã từng làm việc tại các công ty công nghệ hàng đầu.'
    );
    await page.click('button:has-text("Cập nhật hồ sơ")');
    await expect(page.locator('text=Cập nhật hồ sơ thành công')).toBeVisible();

    // Đăng xuất
    await page.click('button:has-text("Đăng xuất")');
  });

  // =========================================================================
  // TC 2: USER ĐĂNG NHẬP VÀ CẬP NHẬT HỒ SƠ (ĐÃ CÓ TÀI KHOẢN)
  // =========================================================================
  test('User can login and update teacher profile', async ({ page }) => {
    // 1. Đăng nhập
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', USER_CREDENTIALS.email);
    await page.fill('input[name="password"]', USER_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // 2. Điều hướng vào trang Profile
    await page.goto('/profile');

    // 3. Kiểm tra hồ sơ đang ở trạng thái PENDING
    await expect(page.locator('text=Đang chờ duyệt')).toBeVisible();

    // 4. Cập nhật hồ sơ
    await page.fill(
      'textarea[placeholder*="tiểu sử"]',
      '[TEST E2E] Đây là nội dung bio đã được cập nhật qua Playwright test.'
    );
    await page.click('button:has-text("Cập nhật hồ sơ")');
    await expect(page.locator('text=Cập nhật hồ sơ thành công')).toBeVisible();

    // Đăng xuất
    await page.click('button:has-text("Đăng xuất")');
  });

  // =========================================================================
  // TC 3: ADMIN KIỂM TRA VÀ DUYỆT HỒ SƠ
  // =========================================================================
  test('Admin can review and approve teacher profile', async ({ page }) => {
    // 1. Admin đăng nhập
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', ADMIN_CREDENTIALS.email);
    await page.fill('input[name="password"]', ADMIN_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // 2. Điều hướng vào trang Quản lý hồ sơ giáo viên
    await page.goto('/admin/teacher-profiles');

    // 3. Tìm hồ sơ của User test
    const row = page.locator(`tr:has-text("${USER_CREDENTIALS.email}")`);
    await expect(row).toBeVisible({ timeout: 10000 });

    // 4. Kiểm tra trạng thái PENDING
    await expect(row.locator('text=PENDING')).toBeVisible();

    // 5. Admin bấm Duyệt
    page.on('dialog', (dialog) => dialog.accept());
    await row.locator('button:has-text("Duyệt")').click();

    // 6. Kiểm tra trạng thái chuyển thành APPROVED
    await expect(row.locator('text=APPROVED')).toBeVisible({ timeout: 10000 });

    // Đăng xuất Admin
    await page.click('button:has-text("Đăng xuất")');
  });

  // =========================================================================
  // TC 4: USER NHẬN QUYỀN GIẢNG VIÊN VÀ TRUY CẬP DASHBOARD
  // =========================================================================
  test('User receives Teacher role and accesses dashboard', async ({ page }) => {
    // 1. User đăng nhập lại
    await page.goto('/sign-in');
    await page.fill('input[name="email"]', USER_CREDENTIALS.email);
    await page.fill('input[name="password"]', USER_CREDENTIALS.password);
    await page.click('button[type="submit"]');
    await page.waitForURL('/');

    // 2. Kiểm tra Badge "Giảng viên" trong User Menu
    await page.click('button[aria-label="User menu"]'); // Hoặc selector avatar
    await expect(page.locator('text=Giảng viên').first()).toBeVisible({ timeout: 5000 });

    // 3. Kiểm tra menu "Khu vực giảng viên" trong sidebar hoặc dropdown
    await expect(page.locator('text=Khu vực giảng viên')).toBeVisible();

    // 4. Kiểm tra bảo vệ route - Truy cập Teacher Dashboard
    await page.goto('/teacher/dashboard');
    await expect(page.locator('h1:has-text("Bảng điều khiển giảng viên")')).toBeVisible({
      timeout: 10000,
    });

    // 5. Kiểm tra trang Profile không còn form đăng ký giảng viên nữa
    await page.goto('/profile');
    await expect(page.locator('text=Đăng ký trở thành Giảng viên')).toBeHidden();

    // 6. Kiểm tra trang Profile hiển thị badge "Giảng viên"
    await expect(page.locator('text=Giảng viên')).toBeVisible();
  });
});
