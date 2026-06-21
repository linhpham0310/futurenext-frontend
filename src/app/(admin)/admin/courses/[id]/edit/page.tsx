'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'react-hot-toast';
import { adminApi } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';

export default function EditCoursePage() {
  const { id } = useParams();
  const router = useRouter();
  const { isAdmin, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', price: 0, status: 'DRAFT' });

  useEffect(() => {
    if (!authLoading && !isAdmin) router.push('/forbidden');
  }, [isAdmin, authLoading, router]);

  useEffect(() => {
    if (isAdmin) {
      const fetchCourse = async () => {
        try {
          const { data } = await adminApi.getCourseDetail(id as string);
          setForm({
            title: data.title,
            description: data.description,
            price: data.price,
            status: data.status,
          });
        } catch {
          toast.error('Không tải được thông tin khóa học');
        } finally {
          setLoading(false);
        }
      };
      fetchCourse();
    }
  }, [id, isAdmin]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await adminApi.updateCourse(id as string, form);
      toast.success('Cập nhật khóa học thành công');
      router.push(`/admin/courses/${id}`);
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isAdmin) return null;

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Chỉnh sửa khóa học</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Tên khóa học</label>
          <Input
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Mô tả</label>
          <Textarea
            rows={5}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Giá (VNĐ)</label>
          <Input
            type="number"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Trạng thái</label>
          <select
            className="w-full border rounded p-2"
            value={form.status}
            onChange={(e) => setForm({ ...form, status: e.target.value })}
          >
            <option value="DRAFT">Bản nháp</option>
            <option value="PUBLISHED">Xuất bản</option>
          </select>
        </div>
        <div className="flex gap-2">
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
