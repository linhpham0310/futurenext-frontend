# [Task: S3-PM-01] Sprint 3 - Bug Backlog & Triage

Tài liệu này theo dõi các lỗi cần ưu tiên xử lý trong Sprint 3 để đảm bảo chất lượng hệ thống nền tảng (Auth & Teacher Workflow).

## Danh sách Bug Ưu tiên cao (High Priority)

| ID      | Module       | Mô tả Lỗi (Bug Description)                                                                                | Trạng thái | Phụ trách | Mức độ |
| ------- | ------------ | ---------------------------------------------------------------------------------------------------------- | ---------- | --------- | ------ |
| BUG-301 | BE (Teacher) | Nếu gửi payload `expertise` không có trường này, CSDL lưu `null`, FE render `.map()` bị crash trắng trang. | DOING      | Backend   | Cao    |
| BUG-302 | FE (Teacher) | Form `TeacherProfileForm` không xóa câu thông báo lỗi cũ khi user bấm nút nộp lại lần 2.                   | DOING      | Frontend  | Cao    |
| BUG-303 | FE (Admin)   | Phân trang bảng danh sách người dùng đôi khi bị disable sai logic khi ở trang cuối.                        | TODO       | Frontend  | Vừa    |

## Hướng dẫn Fix cho Developer

- Sử dụng tag `// [Task: S3-PM-01] Fix: BUG-XXX` tại vị trí sửa code.
- Test kỹ lại bằng các Unit Test hiện có trước khi push.
