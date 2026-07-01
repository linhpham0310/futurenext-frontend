'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { teacherApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import Link from 'next/link';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';

interface QuestionBank {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  _count?: { items: number };
  createdAt: string;
}

export default function TeacherQuestionBanksPage() {
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [banks, setBanks] = useState<QuestionBank[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isTeacher) {
      teacherApi
        .getQuestionBanks()
        .then((res) => setBanks(res.data))
        .catch(() => toast.error('Không thể tải ngân hàng câu hỏi'))
        .finally(() => setLoading(false));
    }
  }, [isTeacher]);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Xóa ngân hàng "${name}"? Tất cả câu hỏi bên trong sẽ bị xóa.`)) return;
    try {
      await teacherApi.deleteQuestionBank(id);
      setBanks(banks.filter((b) => b.id !== id));
      toast.success('Xóa thành công');
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  if (authLoading || loading)
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  if (!isTeacher) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Ngân hàng câu hỏi</h1>
          <p className="text-muted-foreground">Quản lý kho câu hỏi của bạn</p>
        </div>
        <div className="flex gap-2">
          <BackButton />
          <Link href="/teacher/question-banks/create">
            <Button>
              <Plus className="h-4 w-4 mr-1" /> Tạo ngân hàng mới
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách ngân hàng</CardTitle>
        </CardHeader>
        <CardContent>
          {banks.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Chưa có ngân hàng nào.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Tên</TableCell>
                  <TableCell>Mô tả</TableCell>
                  <TableCell>Số câu hỏi</TableCell>
                  <TableCell>Công khai</TableCell>
                  <TableCell>Ngày tạo</TableCell>
                  <TableCell className="text-right">Thao tác</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {banks.map((bank) => (
                  <TableRow key={bank.id}>
                    <TableCell className="font-medium">{bank.name}</TableCell>
                    <TableCell>{bank.description || '—'}</TableCell>
                    <TableCell>{bank._count?.items || 0}</TableCell>
                    <TableCell>{bank.isPublic ? '✅' : '❌'}</TableCell>
                    <TableCell>{new Date(bank.createdAt).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/teacher/question-banks/${bank.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link href={`/teacher/question-banks/${bank.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(bank.id, bank.name)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
