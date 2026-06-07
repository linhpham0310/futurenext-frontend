'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MarkdownEditor } from '@/components/shared/markdown-editor';
import { VideoUploader } from '@/components/shared/video-uploader';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { Spinner } from '@/components/ui/spinner';

export default function LessonEditorPage() {
  const params = useParams();
  const { id: courseId, lessons: lessonId } = params;
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lessonType, setLessonType] = useState<'VIDEO' | 'ARTICLE' | 'QUIZ'>('ARTICLE');
  const [videoKey, setVideoKey] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('courseId:', courseId, 'lessonId:', lessonId);

    const fetchLesson = async () => {
      if (!lessonId || !courseId) return;
      try {
        const res = await apiClient.get(`/courses/${courseId}/lessons/${lessonId}`);
        setLessonType(res.data.type);
        if (res.data.type === 'VIDEO') {
          setVideoKey(res.data.content || '');
        } else {
          setContent(res.data.content || '');
        }
      } catch (error) {
        console.error('Failed to load lesson', error);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId, courseId]);

  const onSave = async () => {
    if (!courseId || !lessonId) {
      toast.error('Thiếu thông tin khóa học hoặc bài học');
      return;
    }
    setIsSaving(true);
    try {
      await apiClient.patch(`/courses/${courseId}/lessons/${lessonId}`, {
        content: lessonType === 'VIDEO' ? videoKey : content,
      });
      toast.success('Đã lưu nội dung bài học');
    } catch (error) {
      toast.error('Lỗi khi lưu nội dung');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUploadSuccess = (fileKey: string) => {
    setVideoKey(fileKey);
    toast.success('Video đã được tải lên, hãy lưu bài học để cập nhật!');
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Soạn thảo nội dung bài học</h2>
        <button
          onClick={onSave}
          disabled={isSaving}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSaving ? 'Đang lưu...' : 'Lưu nội dung'}
        </button>
      </div>

      <div className="flex gap-4 border-b pb-2">
        <button
          onClick={() => setLessonType('ARTICLE')}
          className={`px-3 py-1 rounded-md ${lessonType === 'ARTICLE' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
        >
          📝 Bài viết
        </button>
        <button
          onClick={() => setLessonType('VIDEO')}
          className={`px-3 py-1 rounded-md ${lessonType === 'VIDEO' ? 'bg-blue-100 text-blue-700' : 'text-gray-500'}`}
        >
          🎥 Video
        </button>
      </div>

      {lessonType === 'VIDEO' ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 italic">Tải lên video bài giảng cho học viên.</p>
          <VideoUploader courseId={courseId} onSuccess={handleUploadSuccess} />
          {videoKey && (
            <div className="mt-2 p-2 bg-green-50 text-green-700 rounded-md text-sm">
              ✅ Video đã sẵn sàng: {videoKey.split('/').pop()}
            </div>
          )}
        </div>
      ) : (
        <>
          <MarkdownEditor value={content} onChange={setContent} />
          <p className="text-xs text-gray-400 italic">
            * Lưu ý: Định dạng Markdown giúp hệ thống AI phân tích và hỗ trợ học tập tốt hơn.
          </p>
        </>
      )}
    </div>
  );
}
