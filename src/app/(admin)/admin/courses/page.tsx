// src/app/(admin)/admin/courses/page.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SelectFilter } from '@/components/ui/select-filter';
import { Pagination } from '@/components/ui/pagination';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, Edit, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Dữ liệu mẫu (sau này thay bằng API call)
const mockCourses = Array.from({ length: 8 }, (_, i) => ({
  id: `${i + 1}`,
  title: `Khóa học mẫu ${i + 1}`,
  instructor: 'Giảng viên A',
  status: i % 2 === 0 ? 'PUBLISHED' : 'DRAFT',
  students: Math.floor(Math.random() * 500),
  revenue: Math.floor(Math.random() * 10000000).toLocaleString('vi-VN') + 'đ',
}));

export default function AdminCoursesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const limit = 5;
  const totalPages = Math.ceil(mockCourses.length / limit);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Quản lý khóa học</h1>
        <Button onClick={() => router.push('/admin/courses/create')}>+ Tạo khóa học</Button>
      </div>

      {/* Nhóm bộ lọc */}
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Tìm kiếm khóa học..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <SelectFilter
          label="Trạng thái"
          options={[
            { label: 'Tất cả', value: '' },
            { label: 'Đã xuất bản', value: 'PUBLISHED' },
            { label: 'Bản nháp', value: 'DRAFT' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
      </div>

      {/* Nhóm danh sách khóa học */}
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 font-medium">Tên khóa học</th>
                <th className="p-4 font-medium">Giảng viên</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium">Học viên</th>
                <th className="p-4 font-medium">Doanh thu</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {mockCourses.map((course) => (
                <tr key={course.id} className="border-t hover:bg-muted/50">
                  <td className="p-4 font-medium">{course.title}</td>
                  <td className="p-4">{course.instructor}</td>
                  <td className="p-4">
                    <span
                      className={
                        course.status === 'PUBLISHED' ? 'text-green-600' : 'text-amber-600'
                      }
                    >
                      {course.status === 'PUBLISHED' ? 'Xuất bản' : 'Nháp'}
                    </span>
                  </td>
                  <td className="p-4">{course.students}</td>
                  <td className="p-4">{course.revenue}</td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      {/* Nhóm phân trang */}
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        isLoading={false}
      />
    </div>
  );
}
