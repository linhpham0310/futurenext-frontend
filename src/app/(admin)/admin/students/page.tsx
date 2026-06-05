// src/app/(admin)/admin/students/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SelectFilter } from '@/components/ui/select-filter';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { Search } from 'lucide-react';

const mockStudents = Array.from({ length: 15 }, (_, i) => ({
  id: `student-${i}`,
  fullName: `Học viên ${i + 1}`,
  email: `student${i + 1}@example.com`,
  coursesEnrolled: Math.floor(Math.random() * 5),
  joinedAt: '2025-02-10',
  status: i % 3 === 0 ? 'ACTIVE' : 'LOCKED',
}));

export default function AdminStudentsPage() {
  const { isAdmin, isLoading } = useAuth();
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const totalPages = 3;

  useEffect(() => {
    if (!isLoading && !isAdmin) router.push('/forbidden');
  }, [isLoading, isAdmin, router]);

  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <Spinner />
      </div>
    );
  if (!isAdmin) return null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý học viên</h1>
        <p className="text-muted-foreground">Danh sách tất cả học viên trong hệ thống.</p>
      </div>

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
            { label: 'Tất cả trạng thái', value: '' },
            { label: 'Đang hoạt động', value: 'ACTIVE' },
            { label: 'Đã khóa', value: 'LOCKED' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách học viên</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableCell className="font-semibold">Học viên</TableCell>
                <TableCell className="font-semibold">Số khóa học</TableCell>
                <TableCell className="font-semibold">Ngày tham gia</TableCell>
                <TableCell className="font-semibold">Trạng thái</TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockStudents.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <p className="font-medium">{s.fullName}</p>
                    <p className="text-sm text-muted-foreground">{s.email}</p>
                  </TableCell>
                  <TableCell>{s.coursesEnrolled}</TableCell>
                  <TableCell>{new Date(s.joinedAt).toLocaleDateString('vi-VN')}</TableCell>
                  <TableCell>
                    <span className={s.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}>
                      {s.status === 'ACTIVE' ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </TableCell>
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
