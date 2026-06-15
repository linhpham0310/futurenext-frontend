'use client';

import React from 'react';
import { AdminTeacherProfile } from '@/hooks/admin/use-admin-teacher-profiles';

interface TeacherProfileTableProps {
  profiles: AdminTeacherProfile[];
  isLoading: boolean;
  onReview: (id: string, status: 'approved' | 'rejected') => void; // sửa status thành lowercase
}

export function TeacherProfileTable({ profiles, isLoading, onReview }: TeacherProfileTableProps) {
  if (isLoading) return <div className="p-8 text-center text-gray-500">Đang tải dữ liệu...</div>;
  if (!profiles || profiles.length === 0)
    return <div className="p-8 text-center text-gray-500">Không có hồ sơ nào.</div>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-200">
            <th className="p-4 font-semibold text-gray-700">Người nộp</th>
            <th className="p-4 font-semibold text-gray-700 w-1/3">Tiểu sử (Bio)</th>
            <th className="p-4 font-semibold text-gray-700">Chuyên môn</th>
            <th className="p-4 font-semibold text-gray-700 text-center">Trạng thái</th>
            <th className="p-4 font-semibold text-gray-700 text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {profiles.map((profile) => (
            <tr key={profile.id} className="hover:bg-gray-50">
              {/* Cột 1: Thông tin User */}
              <td className="p-4">
                <div className="font-medium text-gray-900">
                  {profile.user.fullName || 'Chưa cập nhật tên'}
                </div>
                <div className="text-sm text-gray-500">{profile.user.email}</div>
                <div className="text-xs text-gray-400 mt-1">
                  Ngày nộp: {new Date(profile.createdAt).toLocaleDateString()}
                </div>
              </td>

              {/* Cột 2: Bio */}
              <td className="p-4">
                <p className="text-sm text-gray-700 line-clamp-3" title={profile.bio}>
                  {profile.bio}
                </p>
              </td>

              {/* Cột 3: Expertise */}
              <td className="p-4">
                <div className="flex flex-wrap gap-1">
                  {profile.expertise?.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </td>

              {/* Cột 4: Status Badge */}
              <td className="p-4 text-center">
                <span
                  className={`px-2 py-1 text-xs font-semibold rounded-full ${
                    profile.status === 'pending_review'
                      ? 'bg-yellow-100 text-yellow-800'
                      : profile.status === 'approved'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                  }`}
                >
                  {profile.status === 'pending_review'
                    ? 'Chờ duyệt'
                    : profile.status === 'approved'
                      ? 'Đã duyệt'
                      : 'Từ chối'}
                </span>
              </td>

              {/* Cột 5: Actions */}
              <td className="p-4 text-right space-x-2">
                {profile.status === 'pending_review' ? (
                  <>
                    <button
                      onClick={() => {
                        if (
                          window.confirm(
                            'Bạn có chắc chắn muốn DUYỆT hồ sơ này? Người dùng sẽ trở thành Giáo viên.'
                          )
                        ) {
                          onReview(profile.id, 'approved');
                        }
                      }}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition"
                    >
                      Duyệt
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Bạn có chắc chắn muốn TỪ CHỐI hồ sơ này?')) {
                          onReview(profile.id, 'rejected');
                        }
                      }}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700 transition"
                    >
                      Từ chối
                    </button>
                  </>
                ) : (
                  <span className="text-xs text-gray-400">Đã xử lý</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
