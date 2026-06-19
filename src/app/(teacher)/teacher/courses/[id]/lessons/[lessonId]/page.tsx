// app/(dashboard)/teacher/courses/[id]/lessons/[lessonId]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { teacherApi } from '@/lib/api'; // dùng teacherApi thay vì apiClient
import { useAuth } from '@/hooks/auth/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { MarkdownEditor } from '@/components/shared/markdown-editor';
import { VideoUploader } from '@/components/shared/video-uploader';
import { toast } from 'sonner';

export default function LessonEditorPage() {
  const { id: courseId, lessonId } = useParams();
  const router = useRouter();
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [videoKey, setVideoKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch lesson data
  useEffect(() => {
    if (!isTeacher || !courseId || !lessonId) {
      if (!courseId || !lessonId) {
        setError('Thiếu thông tin khóa học hoặc bài học.');
        setLoading(false);
      }
      return;
    }

    const fetchLesson = async () => {
      try {
        const res = await teacherApi.getLesson(courseId as string, lessonId as string);
        setLesson(res.data);
        if (res.data.type === 'VIDEO') {
          setVideoKey(res.data.content || '');
        } else {
          setContent(res.data.content || '');
        }
        setError(null);
      } catch (err: any) {
        console.error('Error fetching lesson:', err);
        // Lấy message từ server hoặc fallback
        const message = err.response?.data?.message || err.message || 'Không thể tải bài học';
        setError(message);
        toast.error(message);
        // Nếu lỗi 404/500, có thể không redirect ngay để người dùng thấy thông báo
      } finally {
        setLoading(false);
      }
    };

    fetchLesson();
  }, [courseId, lessonId, isTeacher]);

  // Lưu nội dung
  const handleSave = async () => {
    if (!lesson) return;
    setIsSaving(true);
    try {
      const payload = {
        content: lesson.type === 'VIDEO' ? videoKey : content,
        duration: lesson.duration || 0,
      };
      await teacherApi.updateLesson(courseId as string, lessonId as string, payload);
      toast.success('Lưu nội dung thành công');
      router.push(`/teacher/courses/${courseId}/builder`);
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Lưu thất bại';
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Loading
  if (authLoading || loading) {
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  }

  // Hiển thị lỗi nếu có
  if (error) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-red-500 font-semibold">Lỗi khi tải bài học:</p>
        <p className="text-gray-700">{error}</p>
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            onClick={() => router.push(`/teacher/courses/${courseId}/builder`)}
          >
            Quay lại Builder
          </Button>
          <Button onClick={() => window.location.reload()}>Thử lại</Button>
        </div>
      </div>
    );
  }

  // Nếu không tìm thấy lesson
  if (!lesson) {
    return (
      <div className="p-8 text-center">
        <p>Bài học không tồn tại hoặc đã bị xóa.</p>
        <Button onClick={() => router.push(`/teacher/courses/${courseId}/builder`)}>
          Quay lại builder
        </Button>
      </div>
    );
  }

  // Giao diện chính
  return (
    <div className="p-6 space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Soạn thảo: {lesson.title}</h2>
        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Đang lưu...' : 'Lưu nội dung'}
        </Button>
      </div>

      {lesson.type === 'VIDEO' ? (
        <div>
          <VideoUploader courseId={courseId as string} onSuccess={(key) => setVideoKey(key)} />
          <p className="mt-2 text-sm text-muted-foreground">
            Video key hiện tại: {videoKey || 'Chưa có video'}
          </p>
        </div>
      ) : (
        <MarkdownEditor value={content} onChange={setContent} />
      )}
    </div>
  );
}
