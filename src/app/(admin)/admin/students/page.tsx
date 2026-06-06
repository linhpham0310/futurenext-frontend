// src/app/(admin)/admin/students/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { Pagination } from '@/components/ui/pagination';
import { PageLoading } from '@/components/shared/page-loading';
import { SearchFilterBar } from '@/components/shared/search-filter-bar';

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

  if (isLoading) return <PageLoading />;
  if (!isAdmin) return null;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Quản lý học viên</h1>
        <p className="text-muted-foreground">Danh sách tất cả học viên trong hệ thống.</p>
      </div>

      <SearchFilterBar
        searchValue={search}
        onSearchChange={setSearch}
        searchPlaceholder="Tìm theo tên hoặc email..."
        filterOptions={[
          { label: 'Tất cả trạng thái', value: '' },
          { label: 'Đang hoạt động', value: 'ACTIVE' },
          { label: 'Đã khóa', value: 'LOCKED' },
        ]}
        filterValue={statusFilter}
        onFilterChange={setStatusFilter}
      />

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
