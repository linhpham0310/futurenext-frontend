export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl min-h-screen">
      <h1 className="text-4xl font-bold tracking-tight mb-8">Điều khoản Sử dụng</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="text-muted-foreground text-lg mb-8">
          Có hiệu lực từ: Tháng 7 năm 2026
        </p>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">1. Chấp nhận điều khoản</h2>
          <p>
            Bằng việc truy cập và sử dụng nền tảng FutureNext.ai, bạn đồng ý tuân thủ các Điều khoản Sử dụng này. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản, vui lòng ngừng sử dụng dịch vụ.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">2. Tài khoản người dùng</h2>
          <ul className="list-disc pl-6 space-y-2">
            <li>Bạn phải cung cấp thông tin chính xác khi đăng ký.</li>
            <li>Bạn chịu trách nhiệm bảo mật mật khẩu và tài khoản của mình.</li>
            <li>Một tài khoản chỉ được sử dụng cho một cá nhân. Việc chia sẻ tài khoản cho nhiều người sử dụng là vi phạm chính sách.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">3. Sở hữu trí tuệ</h2>
          <p className="mb-4">
            Toàn bộ nội dung trên nền tảng (Video, Tài liệu, Bài kiểm tra, Code snippets) đều thuộc sở hữu của FutureNext.ai hoặc các Giảng viên đối tác.
          </p>
          <ul className="list-disc pl-6 space-y-2">
            <li>Bạn được cấp quyền sử dụng nội dung với mục đích học tập cá nhân, phi thương mại.</li>
            <li>Nghiêm cấm mọi hành vi sao chép, phân phối lại, ghi hình hoặc kinh doanh trái phép nội dung trên nền tảng.</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">4. Chính sách hoàn tiền</h2>
          <p>
            Chúng tôi cam kết chất lượng thông qua chính sách hoàn tiền trong vòng 7 ngày kể từ ngày mua khóa học, với điều kiện người học chưa vượt quá 20% tiến độ khóa học. Để yêu cầu hoàn tiền, vui lòng liên hệ bộ phận hỗ trợ.
          </p>
        </section>

        <section>
          <h2 className="text-2xl font-semibold mb-4">5. Thay đổi điều khoản</h2>
          <p>
            FutureNext.ai bảo lưu quyền sửa đổi, bổ sung các điều khoản này bất kỳ lúc nào. Những thay đổi sẽ được thông báo trực tiếp trên website. Việc bạn tiếp tục sử dụng nền tảng sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các điều khoản mới.
          </p>
        </section>
      </div>
    </div>
  );
}
