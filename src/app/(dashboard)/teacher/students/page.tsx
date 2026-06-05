// src/app/(teacher)/teacher/students/page.tsx
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SelectFilter } from '@/components/ui/select-filter';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { Search } from 'lucide-react';

const mockStudents = Array.from({ length: 10 }, (_, i) => ({
  id: `student-${i}`,
  fullName: `Học viên ${i + 1}`,
  email: `student${i + 1}@example.com`,
  enrolledCourse: `Khóa học ${(i % 3) + 1}`,
  progress: Math.floor(Math.random() * 100),
  joinedAt: '2025-01-15',
}));

export default function TeacherStudentsPage() {
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [page, setPage] = useState(1);
  const totalPages = 3;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Học viên của tôi</h1>
        <p className="text-muted-foreground">Quản lý học viên trong các khóa học của bạn.</p>
      </div>

      {/* Nhóm bộ lọc */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <SelectFilter
          options={[
            { label: 'Tất cả khóa học', value: '' },
            { label: 'Khóa học 1', value: '1' },
            { label: 'Khóa học 2', value: '2' },
            { label: 'Khóa học 3', value: '3' },
          ]}
          value={courseFilter}
          onChange={(e) => setCourseFilter(e.target.value)}
          className="w-full sm:w-48"
        />
      </div>

      {/* Nhóm bảng học viên */}
      <Card>
        <CardHeader>
          <CardTitle>Danh sách học viên</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="font-semibold">Học viên</TableCell>
                <TableCell className="font-semibold">Khóa học</TableCell>
                <TableCell className="font-semibold">Tiến độ</TableCell>
                <TableCell className="font-semibold">Ngày tham gia</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStudents.map((student) => (
                <TableRow key={student.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{student.fullName}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{student.enrolledCourse}</TableCell>
                  <TableCell>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{ width: `${student.progress}%` }}
                      />
                    </div>
                    <span className="text-xs">{student.progress}%</span>
                  </TableCell>
                  <TableCell>{new Date(student.joinedAt).toLocaleDateString('vi-VN')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        isLoading={false}
      />
    </div>
  );
}
