import React from 'react';

export const metadata = {
  title: 'Chính sách Cookie | FutureNext',
  description: 'Chính sách Cookie của FutureNext',
};

export default function CookiesPage() {
  return (
    <div className="container max-w-4xl py-12 mx-auto px-4 sm:px-6">
      <h1 className="text-4xl font-bold mb-8">Chính sách Cookie</h1>
      
      <div className="prose prose-slate dark:prose-invert max-w-none">
        <p className="lead text-xl text-muted-foreground mb-8">
          Tại FutureNext, chúng tôi sử dụng cookie để cải thiện trải nghiệm học tập của bạn trên nền tảng.
        </p>

        <section className="space-y-4 mb-8">
          <h2 className="text-2xl font-semibold">1. Cookie là gì?</h2>
          <p>
            Cookie là các tệp văn bản nhỏ được lưu trữ trên thiết bị của bạn khi bạn truy cập trang web của chúng tôi. Chúng giúp trang web ghi nhớ thông tin về chuyến truy cập của bạn, chẳng hạn như ngôn ngữ ưa thích và các cài đặt khác.
          </p>
        </section>

        <section className="space-y-4 mb-8">
          <h2 className="text-2xl font-semibold">2. Cách chúng tôi sử dụng cookie</h2>
          <p>Chúng tôi sử dụng cookie cho các mục đích sau:</p>
          <ul className="list-disc pl-6 space-y-2">
            <li><strong>Cookie thiết yếu:</strong> Cần thiết cho các chức năng cơ bản của nền tảng (như đăng nhập, thanh toán khóa học).</li>
            <li><strong>Cookie hiệu suất:</strong> Giúp chúng tôi hiểu cách người dùng tương tác với trang web để cải thiện hiệu suất.</li>
            <li><strong>Cookie chức năng:</strong> Ghi nhớ các lựa chọn của bạn (như chế độ Dark Mode, tiến độ học tập).</li>
          </ul>
        </section>

        <section className="space-y-4 mb-8">
          <h2 className="text-2xl font-semibold">3. Quản lý cookie</h2>
          <p>
            Bạn có thể kiểm soát và/hoặc xóa cookie theo ý muốn. Bạn có thể xóa tất cả các cookie đã có trên máy tính của mình và bạn có thể thiết lập hầu hết các trình duyệt để ngăn chặn chúng được đặt. Tuy nhiên, nếu bạn làm điều này, bạn có thể phải tự điều chỉnh một số tùy chọn mỗi khi bạn truy cập một trang web và một số dịch vụ và chức năng có thể không hoạt động.
          </p>
        </section>

        <section className="space-y-4 mb-8">
          <h2 className="text-2xl font-semibold">4. Liên hệ</h2>
          <p>
            Nếu bạn có bất kỳ câu hỏi nào về việc chúng tôi sử dụng cookie, vui lòng liên hệ với chúng tôi qua email: <a href="mailto:support@minhtech.com.vn" className="text-primary hover:underline">support@minhtech.com.vn</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
