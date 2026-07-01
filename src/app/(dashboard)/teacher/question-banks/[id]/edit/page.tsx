'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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

export default function EditQuestionBankPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  useEffect(() => {
    if (isTeacher && id) {
      teacherApi
        .getQuestionBank(id as string)
        .then((res) => {
          setName(res.data.name);
          setDescription(res.data.description || '');
          setIsPublic(res.data.isPublic);
        })
        .catch(() => toast.error('Không thể tải ngân hàng'))
        .finally(() => setLoading(false));
    }
  }, [id, isTeacher]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Vui lòng nhập tên ngân hàng');
      return;
    }
    setSubmitting(true);
    try {
      await teacherApi.updateQuestionBank(id as string, {
        name: name.trim(),
        description: description.trim() || undefined,
        isPublic,
      });
      toast.success('Cập nhật thành công');
      router.push(`/teacher/question-banks/${id}`);
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setSubmitting(false);
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Chỉnh sửa ngân hàng câu hỏi</h1>
        <BackButton />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Cập nhật thông tin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Tên ngân hàng *</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
            <div>
              <Label>Mô tả</Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch checked={isPublic} onCheckedChange={setIsPublic} id="public" />
              <Label htmlFor="public">Công khai</Label>
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Đang lưu...' : 'Lưu thay đổi'}
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
