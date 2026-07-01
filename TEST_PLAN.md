# Kế hoạch kiểm thử toàn bộ luồng hệ thống FutureNext.ai

## 1. Mục tiêu

- Đảm bảo toàn bộ luồng nghiệp vụ chính (Auth, User, Course, Assessment, LX, Payment) hoạt động đúng.
- Kiểm tra các tính năng mới: Ngân hàng câu hỏi (Question Bank), Payment Settings, Lab.
- Xác minh phân quyền (RBAC) và bảo mật (ownership).
- Phát hiện lỗi trước khi triển khai.

## 2. Phạm vi

- **Module Auth & Users**: Đăng ký, đăng nhập, quên mật khẩu, profile, RBAC, teacher profile (nộp/duyệt).
- **Module Course**: Tạo, sửa, submit, duyệt/publish, section, lesson, media (video), outcomes, mapping.
- **Module Assessment**: Quiz (Exam) – CRUD, AI generate, từ bank, làm bài, chấm, kết quả. Lab – lấy bài, nộp, chấm tự động.
- **Module LX**: Runtime overview, lesson content, progress update, AI ask.
- **Module Payment**: Cart, checkout, thanh toán (Stripe/VNPay/QR), webhook.
- **Module Question Bank**: Tạo, sửa, xóa bank, thêm/sửa/xóa câu hỏi, chọn từ bank vào quiz.

## 3. Dữ liệu test

- **User**:
  - Admin: `admin@test.com` / `Admin123@` (đã seed)
  - Teacher: `teacher@test.com` / `Teacher123@` (cần tạo hoặc seed)
  - Student: `student@test.com` / `Student123@` (đã seed)
- **Course**: Tạo ít nhất 2 khóa học (1 miễn phí, 1 trả phí) với ít nhất 3 sections, 3 lessons (1 video, 1 article, 1 lab).
- **Quiz**: Tạo ít nhất 3 quiz (1 trắc nghiệm, 1 tự luận, 1 hỗn hợp) từ AI và từ bank.
- **Bank**: Tạo ít nhất 1 bank với 5 câu hỏi (3 MCQ, 2 ESSAY).

## 4. Các kịch bản test chi tiết

### 4.1. Auth & Users

#### TC-AUTH-01: Đăng ký

- **Bước**:
  1. Truy cập trang đăng ký.
  2. Nhập email chưa tồn tại, mật khẩu đạt yêu cầu, họ tên.
  3. Submit.
- **Kết quả mong đợi**:
  - User được tạo với status `PENDING_EMAIL_VERIFY`.
  - Email xác thực được gửi.
  - Thông báo thành công.

#### TC-AUTH-02: Xác thực email

- **Bước**:
  1. Mở email, copy OTP hoặc click link.
  2. Nhập OTP (nếu dùng) hoặc truy cập link.
- **Kết quả mong đợi**:
  - User status chuyển thành `ACTIVE`.
  - Có thể đăng nhập.

#### TC-AUTH-03: Đăng nhập

- **Bước**:
  1. Nhập email + password hợp lệ.
- **Kết quả mong đợi**:
  - Access token + refresh token.
  - Redirect đến dashboard theo role.

#### TC-AUTH-04: Quên mật khẩu

- **Bước**:
  1. Nhập email.
  2. Nhận OTP, đặt mật khẩu mới.
- **Kết quả mong đợi**:
  - Reset thành công, đăng nhập được với mật khẩu mới.
  - Các session cũ bị revoke.

#### TC-AUTH-05: Nộp hồ sơ giáo viên (Teacher)

- **Bước**:
  1. Đăng nhập với student (hoặc tạo mới).
  2. Vào trang "Đăng ký giáo viên".
  3. Điền bio, expertise, submit.
- **Kết quả mong đợi**:
  - Teacher profile được tạo với status `PENDING_REVIEW`.
  - Admin thấy trong danh sách.

#### TC-AUTH-06: Admin duyệt hồ sơ giáo viên

- **Bước**:
  1. Admin vào trang duyệt giáo viên.
  2. Chọn hồ sơ, duyệt hoặc từ chối.
- **Kết quả mong đợi**:
  - Nếu duyệt: user role thành `TEACHER`.
  - Nếu từ chối: user role giữ nguyên, hồ sơ status `REJECTED`.

#### TC-AUTH-07: Admin quản lý user

- **Bước**:
  1. Admin vào trang danh sách user.
  2. Tìm kiếm, lọc theo role/status.
  3. Sửa role, status, xóa user.
- **Kết quả mong đợi**:
  - Thay đổi được lưu.
  - Không thể hạ quyền hoặc xóa admin cuối cùng (kiểm tra lỗi).

---

### 4.2. Course Management

#### TC-COURSE-01: Tạo khóa học (Teacher)

- **Bước**:
  1. Teacher đăng nhập.
  2. Vào trang "Tạo khóa học".
  3. Nhập title, description, price, thumbnail.
- **Kết quả mong đợi**:
  - Course được tạo với status `DRAFT`.
  - Slug tự động sinh.

#### TC-COURSE-02: Thêm section & lesson

- **Bước**:
  1. Vào Course Builder.
  2. Thêm ít nhất 2 sections.
  3. Trong mỗi section, thêm ít nhất 2 lessons (1 video, 1 article, 1 lab).
- **Kết quả mong đợi**:
  - Sections và lessons được lưu đúng thứ tự.
  - Upload video thành công (signed URL).
  - Lab có test cases.

#### TC-COURSE-03: Cập nhật outcomes & mapping

- **Bước**:
  1. Vào tab "Mục tiêu học tập".
  2. Thêm ít nhất 3 LOs.
  3. Map mỗi section với ít nhất 1 LO.
- **Kết quả mong đợi**:
  - LOs được lưu.
  - Mapping được cập nhật thành công.

#### TC-COURSE-04: Submit khóa học (Teacher)

- **Bước**:
  1. Vào chi tiết khóa học.
  2. Nhấn "Gửi duyệt".
- **Kết quả mong đợi**:
  - Nếu đủ điều kiện (≥1 section, ≥5 lessons, có thumbnail) → status `SUBMITTED`.
  - Nếu thiếu → hiển thị lỗi chi tiết.

#### TC-COURSE-05: Admin duyệt khóa học

- **Bước**:
  1. Admin vào danh sách khóa học chờ duyệt.
  2. Chọn 1 khóa, xem curriculum view.
  3. Nhấn "Phê duyệt" hoặc "Từ chối" (kèm lý do).
- **Kết quả mong đợi**:
  - Nếu duyệt: status `PUBLISHED`, xuất hiện trên catalog.
  - Nếu từ chối: status `REJECTED`, teacher nhận được lý do.

---

### 4.3. Assessment (Quiz & Lab)

#### TC-QUIZ-01: Tạo Quiz từ AI (Teacher)

- **Bước**:
  1. Teacher vào trang "Tạo Quiz với AI".
  2. Nhập chủ đề, số câu, loại đề.
  3. Nhấn "Tạo".
- **Kết quả mong đợi**:
  - AI sinh ra danh sách câu hỏi (MCQ/ESSAY).
  - Có thể chỉnh sửa trước khi lưu.

#### TC-QUIZ-02: Thêm câu hỏi từ Ngân hàng (Teacher)

- **Bước**:
  1. Trong trang tạo Quiz, nhấn "Từ ngân hàng".
  2. Chọn bank, tìm câu hỏi, tick chọn, nhấn "Thêm".
- **Kết quả mong đợi**:
  - Các câu hỏi được thêm vào danh sách.
  - Không bị trùng lặp.

#### TC-QUIZ-03: Xuất bản Quiz

- **Bước**:
  1. Teacher chọn Quiz đã tạo.
  2. Nhấn "Xuất bản", chọn khóa học.
- **Kết quả mong đợi**:
  - Quiz được gán vào khóa học, học viên thấy được.

#### TC-QUIZ-04: Student làm Quiz

- **Bước**:
  1. Student đăng nhập, vào khóa học đã enroll.
  2. Mở bài học chứa Quiz, bắt đầu làm.
- **Kết quả mong đợi**:
  - Đếm thời gian.
  - Lưu câu trả lời tạm thời.
  - Nộp bài thành công, xem kết quả.

#### TC-QUIZ-05: Student xem kết quả

- **Bước**:
  1. Sau khi nộp, vào trang kết quả.
- **Kết quả mong đợi**:
  - Hiển thị điểm, số câu đúng/sai.
  - Chi tiết từng câu (đáp án đúng, giải thích).

#### TC-LAB-01: Student làm Lab

- **Bước**:
  1. Student vào bài học LAB.
  2. Viết code, nhấn "Chạy & Nộp".
- **Kết quả mong đợi**:
  - Kết quả từng test case (pass/fail).
  - Nếu pass hết → bài học được đánh dấu hoàn thành.

---

### 4.4. Learning Experience (LX)

#### TC-LX-01: Xem lộ trình học (Runtime Overview)

- **Bước**:
  1. Student vào khóa học đã enroll.
- **Kết quả mong đợi**:
  - Hiển thị danh sách section/lesson, tiến độ chung.
  - Bài học đang học/hoàn thành có trạng thái đúng.

#### TC-LX-02: Học bài (Video/Article)

- **Bước**:
  1. Mở 1 bài học VIDEO, xem video (hoặc click xem).
  2. Mở 1 bài học ARTICLE, đọc nội dung.
- **Kết quả mong đợi**:
  - Video phát được (signed URL).
  - Article hiển thị markdown/HTML.
  - Tiến độ cập nhật (nếu xem ≥70% video hoặc scroll hết article).

#### TC-LX-03: AI hỏi đáp (AI TA)

- **Bước**:
  1. Trong bài học, mở sidebar AI.
  2. Nhập câu hỏi liên quan đến bài học.
- **Kết quả mong đợi**:
  - AI phản hồi (có thể mock nếu chưa tích hợp thật).
  - Câu hỏi và trả lời được lưu log.

#### TC-LX-04: Hoàn thành bài học & tiến độ

- **Bước**:
  1. Hoàn thành bài học (video xem hết, article đọc xong, hoặc nộp lab/quiz).
- **Kết quả mong đợi**:
  - Bài học chuyển status `COMPLETED`.
  - Tiến độ tổng khóa học tăng.

---

### 4.5. Payment & Enrollment

#### TC-PAY-01: Enroll khóa học miễn phí

- **Bước**:
  1. Student chọn khóa học free, nhấn "Đăng ký".
- **Kết quả mong đợi**:
  - Enrollment được tạo, xuất hiện trong "Khóa học của tôi".

#### TC-PAY-02: Thêm vào giỏ hàng

- **Bước**:
  1. Student chọn khóa học trả phí, nhấn "Thêm vào giỏ".
- **Kết quả mong đợi**:
  - Sản phẩm xuất hiện trong giỏ.

#### TC-PAY-03: Thanh toán (Stripe)

- **Bước**:
  1. Vào giỏ, nhấn "Thanh toán".
  2. Chọn Stripe, xác nhận.
- **Kết quả mong đợi**:
  - Redirect đến Stripe Checkout (sandbox).
  - Sau khi thanh toán thành công, webhook cập nhật order → enrollment.

#### TC-PAY-04: Thanh toán VNPay / QR

- **Bước**:
  1. Tương tự như Stripe, chọn VNPay hoặc QR.
- **Kết quả mong đợi**:
  - Redirect đến VNPay hoặc hiển thị QR.
  - Sau khi thanh toán, webhook/return cập nhật order.

#### TC-PAY-05: Xem lịch sử đơn hàng

- **Bước**:
  1. Student vào trang "Đơn hàng của tôi".
- **Kết quả mong đợi**:
  - Hiển thị danh sách đơn hàng với trạng thái.

---

### 4.6. Question Bank (Ngân hàng câu hỏi)

#### TC-BANK-01: Tạo ngân hàng

- **Bước**:
  1. Teacher vào "Ngân hàng câu hỏi".
  2. Nhấn "Tạo ngân hàng mới".
  3. Nhập tên, mô tả, chọn công khai hay không.
- **Kết quả mong đợi**:
  - Ngân hàng được tạo, xuất hiện trong danh sách.

#### TC-BANK-02: Thêm câu hỏi vào ngân hàng

- **Bước**:
  1. Vào chi tiết ngân hàng.
  2. Nhấn "Thêm câu hỏi".
  3. Chọn loại (MCQ/ESSAY), nhập nội dung, options, đáp án, tags.
- **Kết quả mong đợi**:
  - Câu hỏi được lưu, hiển thị trong danh sách.

#### TC-BANK-03: Sửa / xóa câu hỏi trong ngân hàng

- **Bước**:
  1. Chọn một câu hỏi, nhấn sửa hoặc xóa.
- **Kết quả mong đợi**:
  - Sửa: dữ liệu được cập nhật.
  - Xóa: câu hỏi biến mất khỏi danh sách.

#### TC-BANK-04: Sử dụng câu hỏi từ bank vào Quiz

- **Bước**:
  1. Tạo Quiz mới.
  2. Nhấn "Từ ngân hàng", chọn bank và các câu hỏi.
- **Kết quả mong đợi**:
  - Các câu hỏi được thêm vào Quiz.
  - Có thể tiếp tục chỉnh sửa trước khi lưu.

---

### 4.7. Admin & Settings

#### TC-ADMIN-01: Dashboard Admin

- **Bước**:
  1. Admin đăng nhập, xem dashboard.
- **Kết quả mong đợi**:
  - Hiển thị stats (users, courses, revenue, pending requests).

#### TC-ADMIN-02: Quản lý danh mục

- **Bước**:
  1. Admin vào "Danh mục".
  2. Thêm, sửa, xóa danh mục.
- **Kết quả mong đợi**:
  - CRUD hoạt động bình thường.

#### TC-ADMIN-03: Cấu hình hệ thống

- **Bước**:
  1. Admin vào "Thiết lập".
  2. Cập nhật thông tin (Stripe key, VNPay, SMTP, AI config).
- **Kết quả mong đợi**:
  - Lưu thành công, đọc lại thấy đúng.

#### TC-ADMIN-04: Gửi thông báo

- **Bước**:
  1. Admin vào "Truyền thông".
  2. Tạo thông báo mới, chọn đối tượng, gửi.
- **Kết quả mong đợi**:
  - Thông báo xuất hiện trong danh sách.
  - Người dùng nhận được notification (in-app/email).

---

## 5. Kiểm tra bảo mật & phân quyền

| Test case | Hành động                                        | Kết quả mong đợi |
| --------- | ------------------------------------------------ | ---------------- |
| TC-SEC-01 | Student truy cập route admin                     | 403 Forbidden    |
| TC-SEC-02 | Student truy cập route teacher                   | 403 Forbidden    |
| TC-SEC-03 | Student truy cập lesson chưa enroll (không free) | 403 Forbidden    |
| TC-SEC-04 | Teacher sửa course của người khác                | 403 Forbidden    |
| TC-SEC-05 | Hạ quyền admin cuối cùng                         | Bị chặn với lỗi  |
| TC-SEC-06 | Xóa admin cuối cùng                              | Bị chặn với lỗi  |

---

## 6. Kiểm tra lỗi dự kiến

- **DB lỗi**: Hiển thị lỗi 500, rollback transaction.
- **Rate limit**: Sau nhiều lần đăng nhập sai → lockout, thông báo rõ.
- **Upload file quá lớn**: Lỗi từ storage, hiển thị thông báo.
- **Token hết hạn**: FE tự động refresh, nếu fail → logout.

---

## 7. Công cụ và môi trường

- **Môi trường**: Development (localhost hoặc staging).
- **Dữ liệu**: Seed script đã có (admin, student).
- **Công cụ**: Postman / Insomnia để test API riêng, browser devtools.
- **Giám sát**: Kiểm tra log backend, Redis cache, database.

---

## 8. Kết luận

Sau khi chạy toàn bộ test plan trên, nếu tất cả các test case đều **PASS**, hệ thống sẵn sàng cho production (hoặc giai đoạn UAT tiếp theo). Nếu có lỗi, ghi nhận và sửa theo mức độ ưu tiên.

**Người thực hiện**:  
**Ngày**:  
**Kết quả**: [PASS / FAIL]
