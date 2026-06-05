'use client';

// [Task: S3-FE-02] Trang Admin quản lý danh sách hồ sơ Giáo viên
import React, { useEffect } from 'react';
import { useAdminTeacherProfiles } from '@/hooks/admin/use-admin-teacher-profiles';
import { TeacherProfileTable } from '@/components/features/admin/teacher-profile-table';

export default function AdminTeacherProfilesPage() {
  const { profiles, isLoading, filters, setFilters, fetchProfiles, reviewProfile } =
    useAdminTeacherProfiles();

  // Gọi API mỗi khi filter thay đổi (status, page)
  useEffect(() => {
    fetchProfiles();
  }, [fetchProfiles]);

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-800">Duyệt hồ sơ Giảng viên</h1>

        {/* [Task: S3-FE-02] Bộ lọc trạng thái */}
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium text-gray-700">Trạng thái:</label>
          <select
            value={filters.status}
            onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value, page: 1 }))}
            className="p-2 border border-gray-300 rounded-md shadow-sm outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="ALL">Tất cả</option>
            <option value="PENDING">Chờ duyệt (Pending)</option>
            <option value="APPROVED">Đã duyệt (Approved)</option>
            <option value="REJECTED">Đã từ chối (Rejected)</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {/* [Task: S3-FE-02] Render Component Bảng */}
        <TeacherProfileTable profiles={profiles} isLoading={isLoading} onReview={reviewProfile} />

        {/* Pagination đơn giản (có thể thay thế bằng Component Pagination dùng chung của dự án) */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-2">
          <button
            disabled={filters.page <= 1 || isLoading}
            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page - 1 }))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Trước
          </button>
          <span className="px-3 py-1">Trang {filters.page}</span>
          <button
            // Vô hiệu hóa nếu số lượng hồ sơ hiện tại ít hơn limit (hoặc dựa vào totalPages nếu có)
            disabled={profiles.length < filters.limit || isLoading}
            onClick={() => setFilters((prev) => ({ ...prev, page: prev.page + 1 }))}
            className="px-3 py-1 border rounded disabled:opacity-50"
          >
            Sau
          </button>
        </div>
      </div>
    </div>
  );
}
