import React from 'react';
import Link from 'next/link';
import { Mail, MessageCircle, Phone, FileQuestion, BookOpen } from 'lucide-react';

export const metadata = {
  title: 'Trung tâm trợ giúp | FutureNext',
  description: 'Trung tâm trợ giúp và hỗ trợ học viên FutureNext',
};

export default function HelpPage() {
  return (
    <div className="container max-w-5xl py-12 mx-auto px-4 sm:px-6">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Xin chào, chúng tôi có thể giúp gì cho bạn?</h1>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          Tìm kiếm câu trả lời cho các vấn đề thường gặp hoặc liên hệ trực tiếp với đội ngũ hỗ trợ của chúng tôi.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Link href="/faq" className="group p-6 rounded-xl border bg-card text-card-foreground hover:shadow-md transition-all">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <FileQuestion className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Câu hỏi thường gặp (FAQ)</h3>
          <p className="text-sm text-muted-foreground">
            Các câu hỏi phổ biến về đăng ký tài khoản, thanh toán, và cách học tập hiệu quả.
          </p>
        </Link>

        <Link href="/courses" className="group p-6 rounded-xl border bg-card text-card-foreground hover:shadow-md transition-all">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <BookOpen className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Hướng dẫn học tập</h3>
          <p className="text-sm text-muted-foreground">
            Tài liệu hướng dẫn sử dụng nền tảng, xem video, làm bài tập và nhận chứng chỉ.
          </p>
        </Link>

        <div className="group p-6 rounded-xl border bg-card text-card-foreground hover:shadow-md transition-all">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <h3 className="font-semibold text-lg mb-2">Hỗ trợ kỹ thuật</h3>
          <p className="text-sm text-muted-foreground">
            Gặp lỗi khi xem video, lỗi hiển thị trang web hoặc các vấn đề kỹ thuật khác.
          </p>
        </div>
      </div>

      <div className="bg-muted/50 rounded-2xl p-8 text-center max-w-3xl mx-auto border">
        <h2 className="text-2xl font-semibold mb-6">Bạn vẫn cần thêm sự trợ giúp?</h2>
        <div className="flex flex-col sm:flex-row justify-center gap-6">
          <a href="mailto:support@minhtech.com.vn" className="flex items-center justify-center gap-2 px-6 py-3 bg-background border rounded-lg hover:bg-muted transition-colors">
            <Mail className="h-5 w-5 text-primary" />
            <span className="font-medium">Gửi Email</span>
          </a>
          <a href="tel:1900123456" className="flex items-center justify-center gap-2 px-6 py-3 bg-background border rounded-lg hover:bg-muted transition-colors">
            <Phone className="h-5 w-5 text-primary" />
            <span className="font-medium">Gọi Hotline</span>
          </a>
        </div>
        <p className="text-sm text-muted-foreground mt-6">
          Thời gian làm việc: 8:00 - 17:30, từ Thứ Hai đến Thứ Bảy
        </p>
      </div>
    </div>
  );
}
