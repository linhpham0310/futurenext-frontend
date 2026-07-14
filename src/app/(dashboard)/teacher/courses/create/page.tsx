'use client';

import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { teacherApi } from '@/lib/api';
import { toast } from 'sonner';
import { useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { Save, ImageIcon } from 'lucide-react';

const courseSchema = z.object({
  title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
  description: z.string().optional(),
  price: z.number().min(0, 'Giá không được âm').default(0),
  thumbnailUrl: z.string().optional(),
});

type CourseFormValues = z.infer<typeof courseSchema>;

export default function CreateCoursePage() {
  const { isTeacher, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CourseFormValues>({
    resolver: zodResolver(courseSchema) as any,
    defaultValues: { title: '', price: 0, description: '', thumbnailUrl: '' },
  });

  if (authLoading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isTeacher) return null;

  const onSubmit = async (data: CourseFormValues) => {
    setIsSubmitting(true);
    try {
      const response = await teacherApi.createCourse(data);
      toast.success('Tạo bản nháp thành công!');
      router.push(`/teacher/courses/${response.data.id}/builder`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Có lỗi xảy ra');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Cài đặt khóa học mới</h1>
        <p className="text-muted-foreground">Bắt đầu hành trình chia sẻ kiến thức AI-Native của bạn.</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-8 bg-card p-8 rounded-xl shadow-sm border"
      >
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Tiêu đề khóa học *</label>
          <input
            {...register('title')}
            className={`w-full p-3 border rounded-lg focus:ring-2 focus:ring-ring outline-none ${errors.title ? 'border-red-500' : 'border-border'}`}
          />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">Mô tả tổng quan</label>
          <textarea
            {...register('description')}
            rows={4}
            className="w-full p-3 border border-border rounded-lg"
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Giá bán (VNĐ)</label>
            <input
              type="number"
              {...register('price', { valueAsNumber: true })}
              className="w-full p-3 border border-border rounded-lg"
            />
            {errors.price && <p className="text-red-500 text-xs mt-1">{errors.price.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Hình đại diện (URL)
            </label>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-border">
                <ImageIcon className="text-muted-foreground" />
              </div>
              <input
                {...register('thumbnailUrl')}
                placeholder="https://..."
                className="flex-1 p-3 border border-border rounded-lg"
              />
            </div>
          </div>
        </div>
        <hr />
        <div className="flex justify-end gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-border rounded-lg hover:bg-muted/50"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 flex items-center gap-2 disabled:bg-primary/60"
          >
            <Save size={18} /> {isSubmitting ? 'Đang lưu...' : 'Lưu bản nháp'}
          </button>
        </div>
      </form>
    </div>
  );
}
