'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient, teacherApi } from '@/lib/api';
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

  useEffect(() => {
    if (isTeacher && courseId && lessonId) {
      apiClient
        .get(`/teacher/courses/${courseId}/lessons/${lessonId}`)
        .then((res) => {
          setLesson(res.data);
          if (res.data.type === 'VIDEO') setVideoKey(res.data.content || '');
          else setContent(res.data.content || '');
          setLoading(false);
        })
        .catch(() => toast.error('Không tải được bài học'));
    }
  }, [courseId, lessonId, isTeacher]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = { content: lesson?.type === 'VIDEO' ? videoKey : content };
      await teacherApi.updateLesson(courseId as string, lessonId as string, payload);
      toast.success('Lưu nội dung thành công');
      router.push(`/teacher/courses/${courseId}/builder`);
    } catch {
      toast.error('Lưu thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || loading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isTeacher || !lesson) return null;

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
          <p className="mt-2 text-sm">Video key: {videoKey}</p>
        </div>
      ) : (
        <MarkdownEditor value={content} onChange={setContent} />
      )}
    </div>
  );
}
