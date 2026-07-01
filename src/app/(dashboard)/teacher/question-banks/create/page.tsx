'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { teacherApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { BackButton } from '@/components/ui/back-button';

export default function CreateQuestionBankPage() {
  const router = useRouter();
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên ngân hàng');
      return;
    }
    setSubmitting(true);
    try {
      const res = await teacherApi.createQuestionBank({
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic,
      });
      toast.success('Tạo ngân hàng thành công');
      router.push(`/teacher/question-banks/${res.data.id}`);
    } catch {
      toast.error('Tạo thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading)
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  if (!isTeacher) return null;

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tạo ngân hàng câu hỏi</h1>
        <BackButton />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin ngân hàng</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Tên ngân hàng *</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ví dụ: React cơ bản"
                required
              />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Mô tả nội dung ngân hàng..."
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={isPublic} onCheckedChange={setIsPublic} id="public" />
              <Label htmlFor="public">Công khai (cho phép giáo viên khác sử dụng)</Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Đang tạo...' : 'Tạo ngân hàng'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
