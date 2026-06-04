'use client';
import React from 'react';
// Khởi chạy giao diện chính nội dung bài học
export default function LxPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6">
      <div className="aspect-video bg-black rounded-xl flex items-center justify-center text-white font-medium shadow-md">
        [ TRÌNH PHÁT VIDEO PLAYER STUB - SPRINT 2 ]
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-800">1.2 Cài đặt môi trường hệ thống</h2>
        <p className="text-gray-600 text-sm leading-relaxed">
          Trong bài giảng này, chúng ta sẽ thiết lập môi trường Runtime cho Next.js kết hợp với
          Docker PostgreSQL để sẵn sàng kết nối dữ liệu. Vui lòng chuẩn bị sẵn Docker Desktop trước
          khi sang bài tiếp theo.
        </p>
      </div>
    </div>
  );
}
