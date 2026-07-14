'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { teacherApi, commonApi } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { MarkdownEditor } from '@/components/shared/markdown-editor';
import { toast } from 'sonner';
import { Save } from 'lucide-react';

interface Category {
  id: string;
  name: string;
}

interface CourseForm {
  title: string;
  shortDescription: string;
  description: string;
  price: number;
  thumbnailUrl: string;
  language: string;
  level: string;
  categoryId: string; // 'none' nếu chưa phân loại
  status: string;
}

export default function CourseEditPage() {
  const { id: courseId } = useParams();
  const router = useRouter();
  const { isTeacher, isLoading: authLoading } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<CourseForm | null>(null);

  useEffect(() => {
    if (!authLoading && !isTeacher) router.push('/forbidden');
  }, [isTeacher, authLoading, router]);

  useEffect(() => {
    if (isTeacher && courseId) {
      Promise.all([teacherApi.getCourseDetail(courseId as string), commonApi.getCategories()])
        .then(([courseRes, categoriesRes]) => {
          const c = courseRes.data;
          setForm({
            title: c.title || '',
            shortDescription: c.shortDescription || '',
            description: c.description || '',
            price: c.price != null ? Number(c.price) : 0,
            thumbnailUrl: c.thumbnailUrl || '',
            language: c.language || 'vi',
            level: c.level || 'beginner',
            categoryId: c.categoryId || 'none',
            status: c.status,
          });
          setCategories(categoriesRes.data || []);
        })
        .catch(() => toast.error('Không tải được thông tin khóa học'))
        .finally(() => setLoading(false));
    }
  }, [courseId, isTeacher]);

  const updateForm = (field: keyof CourseForm, value: any) => {
    setForm((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  const handleSave = async () => {
    if (!form) return;
    if (!form.title.trim()) {
      toast.error('Vui lòng nhập tiêu đề khóa học');
      return;
    }
    setSaving(true);
    try {
      await teacherApi.updateCourse(courseId as string, {
        title: form.title,
        shortDescription: form.shortDescription || undefined,
        description: form.description || undefined,
        price: form.price,
        thumbnailUrl: form.thumbnailUrl || undefined,
        language: form.language,
        level: form.level,
        categoryId: form.categoryId === 'none' ? undefined : form.categoryId,
      });
      toast.success('Cập nhật khóa học thành công');
      router.push(`/teacher/courses/${courseId}/builder`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }
  if (!isTeacher || !form) return null;

  const canEdit = form.status === 'DRAFT' || form.status === 'REJECTED';

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="text-2xl font-bold">Sửa thông tin khóa học</h1>
      </div>

      {!canEdit && (
        <div className="rounded border border-border bg-muted/50 p-4 text-sm text-amber-600">
          Khóa học đang ở trạng thái <strong>{form.status}</strong>, không thể chỉnh sửa thông tin.
          Chỉ khóa học ở trạng thái nháp hoặc bị từ chối mới được sửa.
        </div>
      )}

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <Label>Tiêu đề</Label>
            <Input
              value={form.title}
              onChange={(e) => updateForm('title', e.target.value)}
              disabled={!canEdit}
            />
          </div>

          <div>
            <Label>Mô tả ngắn</Label>
            <Textarea
              value={form.shortDescription}
              onChange={(e) => updateForm('shortDescription', e.target.value)}
              placeholder="Mô tả ngắn gọn hiển thị ở trang danh sách khóa học (tối đa 500 ký tự)"
              rows={2}
              maxLength={500}
              disabled={!canEdit}
            />
          </div>

          <div>
            <Label>Mô tả chi tiết</Label>
            <MarkdownEditor
              value={form.description}
              onChange={(val) => updateForm('description', val)}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Giá (VNĐ)</Label>
              <Input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => updateForm('price', Number(e.target.value))}
                disabled={!canEdit}
              />
            </div>
            <div>
              <Label>Ảnh thumbnail (URL)</Label>
              <Input
                value={form.thumbnailUrl}
                onChange={(e) => updateForm('thumbnailUrl', e.target.value)}
                placeholder="https://..."
                disabled={!canEdit}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label>Danh mục</Label>
              <Select
                value={form.categoryId}
                onValueChange={(val) => updateForm('categoryId', val)}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Chưa phân loại</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Trình độ</Label>
              <Select
                value={form.level}
                onValueChange={(val) => updateForm('level', val)}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trình độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Cơ bản</SelectItem>
                  <SelectItem value="intermediate">Trung cấp</SelectItem>
                  <SelectItem value="advanced">Nâng cao</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Ngôn ngữ</Label>
              <Select
                value={form.language}
                onValueChange={(val) => updateForm('language', val)}
                disabled={!canEdit}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Chọn ngôn ngữ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vi">Tiếng Việt</SelectItem>
                  <SelectItem value="en">Tiếng Anh</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={saving || !canEdit}>
              <Save className="h-4 w-4 mr-1" />
              {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/teacher/courses/${courseId}/builder`)}
            >
              Quay lại chỉnh sửa cấu trúc
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
