'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { teacherApi } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function EditCoursePage() {
  const { id } = useParams();
  const router = useRouter();
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingOutcomes, setLoadingOutcomes] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', price: 0, thumbnailUrl: '' });
  const [outcomes, setOutcomes] = useState<string[]>([]);

  useEffect(() => {
    if (!authLoading && !isTeacher) router.push('/forbidden');
  }, [isTeacher, authLoading, router]);

  useEffect(() => {
    if (isTeacher && id) {
      teacherApi
        .getCourseDetail(id as string)
        .then((res) => {
          const c = res.data;
          setForm({
            title: c.title,
            description: c.description || '',
            price: c.price,
            thumbnailUrl: c.thumbnailUrl || '',
          });
          setOutcomes(c.outcomes || []);
        })
        .catch(() => toast.error('Không tải được dữ liệu'))
        .finally(() => setLoading(false));
    }
  }, [id, isTeacher]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await teacherApi.updateCourse(id as string, form);
      toast.success('Cập nhật thành công');
      router.push(`/teacher/courses/${id}`);
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleAddOutcome = () => setOutcomes([...outcomes, '']);
  const handleOutcomeChange = (idx: number, val: string) => {
    const newOutcomes = [...outcomes];
    newOutcomes[idx] = val;
    setOutcomes(newOutcomes);
  };
  const handleRemoveOutcome = (idx: number) => setOutcomes(outcomes.filter((_, i) => i !== idx));
  const handleSaveOutcomes = async () => {
    setLoadingOutcomes(true);
    try {
      await teacherApi.updateOutcomes(id as string, outcomes);
      toast.success('Cập nhật outcomes thành công');
    } catch {
      toast.error('Lỗi cập nhật outcomes');
    } finally {
      setLoadingOutcomes(false);
    }
  };

  if (authLoading || loading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isTeacher) return null;

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Chỉnh sửa khóa học</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block mb-1">Tiêu đề *</label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block mb-1">Mô tả</label>
          <Textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={4}
          />
        </div>
        <div>
          <label className="block mb-1">Giá (VNĐ)</label>
          <Input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <label className="block mb-1">URL ảnh đại diện</label>
          <Input
            value={form.thumbnailUrl}
            onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })}
          />
        </div>
        <div className="border-t pt-4">
          <label className="block text-sm font-medium mb-2">Kết quả đạt được </label>
          {outcomes.map((outcome, idx) => (
            <div key={idx} className="flex gap-2 mb-2">
              <input
                value={outcome}
                onChange={(e) => handleOutcomeChange(idx, e.target.value)}
                className="flex-1 p-2 border rounded"
                placeholder={`Kết quả ${idx + 1}`}
              />
              <button
                type="button"
                onClick={() => handleRemoveOutcome(idx)}
                className="text-red-500"
              >
                Xóa
              </button>
            </div>
          ))}
          <button type="button" onClick={handleAddOutcome} className="text-blue-600 text-sm mt-1">
            + Thêm kết quả
          </button>
          <button
            type="button"
            onClick={handleSaveOutcomes}
            disabled={loadingOutcomes}
            className="ml-2 text-green-600 text-sm"
          >
            {loadingOutcomes ? 'Đang lưu...' : 'Lưu kết quả'}
          </button>
        </div>
        <div className="flex gap-2 pt-4">
          <Button type="submit" disabled={saving}>
            {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
