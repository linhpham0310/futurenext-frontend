'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { teacherApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { BackButton } from '@/components/ui/back-button';
import { Plus, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

interface QuestionItem {
  id: string;
  type: 'MCQ' | 'ESSAY' | 'CODING';
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  difficulty?: string;
  tags: string[];
  createdAt: string;
}

interface BankDetail {
  id: string;
  name: string;
  description?: string;
  isPublic: boolean;
  items: QuestionItem[];
}

export default function QuestionBankDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [bank, setBank] = useState<BankDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isTeacher && id) {
      teacherApi
        .getQuestionBank(id as string)
        .then((res) => setBank(res.data))
        .catch(() => toast.error('Không thể tải ngân hàng'))
        .finally(() => setLoading(false));
    }
  }, [id, isTeacher]);

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirm('Xóa câu hỏi này?')) return;
    try {
      await teacherApi.deleteQuestionItem(id as string, questionId);
      setBank((prev) =>
        prev ? { ...prev, items: prev.items.filter((q) => q.id !== questionId) } : null
      );
      toast.success('Xóa câu hỏi thành công');
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
  if (!isTeacher || !bank) return null;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{bank.name}</h1>
          <p className="text-muted-foreground">{bank.description || 'Không có mô tả'}</p>
        </div>
        <div className="flex gap-2">
          <BackButton />
          <Link href={`/teacher/question-banks/${id}/add`}>
            <Button>
              <Plus className="h-4 w-4 mr-1" /> Thêm câu hỏi
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách câu hỏi ({bank.items.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {bank.items.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Chưa có câu hỏi nào.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Nội dung</TableCell>
                  <TableCell>Loại</TableCell>
                  <TableCell>Độ khó</TableCell>
                  <TableCell>Tags</TableCell>
                  <TableCell className="text-right">Thao tác</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bank.items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-xs truncate">{item.questionText}</TableCell>
                    <TableCell>
                      {item.type === 'MCQ'
                        ? 'Trắc nghiệm'
                        : item.type === 'ESSAY'
                          ? 'Tự luận'
                          : 'Lập trình'}
                    </TableCell>
                    <TableCell>{item.difficulty || '—'}</TableCell>
                    <TableCell>{item.tags?.join(', ') || '—'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/teacher/question-banks/${id}/edit/${item.id}`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteQuestion(item.id)}
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
