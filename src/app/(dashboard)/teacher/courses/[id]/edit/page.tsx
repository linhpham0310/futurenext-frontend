'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { apiClient } from '@/lib/api';
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
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: { title: '', description: '', price: 0, thumbnailUrl: '' },
  });

  useEffect(() => {
    if (!authLoading && !isTeacher) router.push('/forbidden');
  }, [isTeacher, authLoading, router]);

  useEffect(() => {
    if (isTeacher && id) {
      apiClient
        .get(`/teacher/courses/${id}`)
        .then((res) => {
          setValue('title', res.data.title);
          setValue('description', res.data.description || '');
          setValue('price', res.data.price);
          setValue('thumbnailUrl', res.data.thumbnailUrl || '');
          setLoading(false);
        })
        .catch(() => toast.error('Không tải được dữ liệu'));
    }
  }, [id, isTeacher, setValue]);

  const onSubmit = async (data: any) => {
    try {
      await apiClient.put(`/teacher/courses/${id}`, data);
      toast.success('Cập nhật thành công');
      router.push(`/teacher/courses/${id}`);
    } catch (error) {
      toast.error('Cập nhật thất bại');
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
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block mb-1">Tiêu đề *</label>
          <Input {...register('title', { required: 'Vui lòng nhập tiêu đề' })} />
          {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block mb-1">Mô tả</label>
          <Textarea {...register('description')} rows={4} />
        </div>
        <div>
          <label className="block mb-1">Giá (VNĐ)</label>
          <Input type="number" {...register('price', { valueAsNumber: true })} />
        </div>
        <div>
          <label className="block mb-1">URL ảnh đại diện</label>
          <Input {...register('thumbnailUrl')} />
        </div>
        <div className="flex gap-2">
          <Button type="submit" disabled={isSubmitting}>
            Lưu thay đổi
          </Button>
          <Button type="button" variant="outline" onClick={() => router.back()}>
            Hủy
          </Button>
        </div>
      </form>
    </div>
  );
}
