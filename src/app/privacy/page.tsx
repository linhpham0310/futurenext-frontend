export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl min-h-screen">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Chính sách Bảo mật</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="text-muted-foreground text-lg mb-8">
          Cập nhật lần cuối: Tháng 7 năm 2026
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">1. Thu thập thông tin</h2>
          <p className="mb-4">
            Chúng tôi thu thập thông tin bạn cung cấp trực tiếp cho chúng tôi, ví dụ như khi bạn tạo tài khoản, đăng ký khóa học, cập nhật hồ sơ, tham gia diễn đàn thảo luận hoặc liên hệ với chúng tôi.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Thông tin tài khoản: Email, họ tên, mật khẩu.</li>
            <li>Dữ liệu hồ sơ: Ảnh đại diện, tiểu sử, thông tin liên hệ.</li>
            <li>Dữ liệu thanh toán: Được xử lý an toàn thông qua đối tác thanh toán (VNPay/Stripe), chúng tôi không lưu trữ trực tiếp thẻ của bạn.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">2. Sử dụng thông tin</h2>
          <p className="mb-4">
            Chúng tôi sử dụng thông tin thu thập được để:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Cung cấp, duy trì và cải thiện nền tảng học tập.</li>
            <li>Cá nhân hóa trải nghiệm và đề xuất khóa học phù hợp.</li>
            <li>Xử lý giao dịch và gửi thông báo liên quan (ví dụ: xác nhận đăng ký, chứng chỉ).</li>
            <li>Phát hiện, điều tra và ngăn chặn các hành vi gian lận hoặc vi phạm chính sách.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">3. Chia sẻ thông tin</h2>
          <p className="mb-4">
            Chúng tôi không bán hoặc cho thuê thông tin cá nhân của bạn cho bên thứ ba. Thông tin chỉ được chia sẻ trong các trường hợp:
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Với giảng viên (Giới hạn ở thông tin cần thiết để quản lý lớp học).</li>
            <li>Với các đối tác dịch vụ (Ví dụ: Email service, Payment Gateway).</li>
            <li>Khi có yêu cầu từ cơ quan pháp luật có thẩm quyền.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">4. Quyền của bạn</h2>
          <p>
            Bạn có quyền truy cập, chỉnh sửa hoặc xóa thông tin cá nhân của mình bất kỳ lúc nào thông qua phần Cài đặt tài khoản. Nếu cần hỗ trợ thêm, vui lòng liên hệ qua email: support@futurenext.ai.
          </p>
        </section>
      </div>
    </div>
  );
}
