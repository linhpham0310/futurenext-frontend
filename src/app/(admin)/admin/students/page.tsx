'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SelectFilter } from '@/components/ui/select-filter';
import { Pagination } from '@/components/ui/pagination';
import { Button } from '@/components/ui/button';
import { Eye, Lock, Unlock, Trash2 } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';

interface Student {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  coursesEnrolled: number;
  joinedAt: string;
  status: 'active' | 'locked';
}

export default function AdminStudentsPage() {
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useAuth();

  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/forbidden');
  }, [isAdmin, authLoading, router]);

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await adminApi.getStudents({
        q: search,
        status: statusFilter || undefined,
        page,
        limit,
      });
      setStudents(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch {
      toast.error('Không thể tải danh sách học viên');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, page, limit]);

  useEffect(() => {
    if (isAdmin) fetchStudents();
  }, [isAdmin, fetchStudents]);

  const toggleStatus = async (student: Student) => {
    const newStatus = student.status === 'active' ? 'locked' : 'active';
    const action = newStatus === 'active' ? 'mở khóa' : 'khóa';
    if (!confirm(`Bạn có chắc muốn ${action} học viên "${student.fullName}"?`)) return;
    try {
      await adminApi.updateStudentStatus(student.id, newStatus);
      toast.success(`Đã ${action} học viên`);
      fetchStudents();
    } catch {
      toast.error('Thay đổi trạng thái thất bại');
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa học viên "${name}"? Hành động không thể hoàn tác.`)) return;
    try {
      await adminApi.deleteStudent(id);
      toast.success('Xóa học viên thành công');
      fetchStudents();
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  const getStatusBadge = (status: string) => {
    if (status === 'active')
      return (
        <span className="text-green-600 bg-green-100 px-2 py-1 rounded-full text-xs">
          Hoạt động
        </span>
      );
    return <span className="text-red-600 bg-red-100 px-2 py-1 rounded-full text-xs">Đã khóa</span>;
  };

  if (authLoading)
    return (
      <div className="p-8 flex justify-center">
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
      <div className="flex flex-wrap gap-4">
        <Input
          placeholder="Tìm theo tên hoặc email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-xs"
        />
        <SelectFilter
          label="Trạng thái"
          options={[
            { label: 'Tất cả', value: '' },
            { label: 'Hoạt động', value: 'active' },
            { label: 'Đã khóa', value: 'locked' },
          ]}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        />
      </div>
      <Card>
        <CardContent className="p-0">
          <table className="w-full text-left">
            <thead className="bg-muted/50">
              <tr>
                <th className="p-4 font-medium">Học viên</th>
                <th className="p-4 font-medium">Số khóa học</th>
                <th className="p-4 font-medium">Ngày tham gia</th>
                <th className="p-4 font-medium">Trạng thái</th>
                <th className="p-4 font-medium text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    <Spinner />
                  </td>
                </tr>
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8">
                    Không có học viên nào
                  </td>
                </tr>
              ) : (
                students.map((student) => (
                  <tr key={student.id} className="border-t hover:bg-muted/50">
                    <td className="p-4">
                      <p className="font-medium">{student.fullName}</p>
                      <p className="text-sm text-muted-foreground">{student.email}</p>
                    </td>
                    <td className="p-4">{student.coursesEnrolled}</td>
                    <td className="p-4">
                      {new Date(student.joinedAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="p-4">{getStatusBadge(student.status)}</td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/admin/users/students/${student.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => toggleStatus(student)}>
                          {student.status === 'active' ? (
                            <Lock className="h-4 w-4" />
                          ) : (
                            <Unlock className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(student.id, student.fullName)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <Pagination
        currentPage={page}
        totalPages={totalPages}
        onPageChange={setPage}
        isLoading={loading}
      />
    </div>
  );
}
