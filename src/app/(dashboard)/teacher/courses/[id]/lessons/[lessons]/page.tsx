'use client';
import React, { useState, useEffect } from 'react';
import { MarkdownEditor } from '@/components/shared/markdown-editor'; // (NEW - S3-CM-04)
import { VideoUploader } from '@/components/shared/video-uploader'; // (NEW - S3-CM-05)
import { useCourseBuilderStore } from '@/store/use-course-builder-store';
import axios from 'axios';
import { toast } from 'react-hot-toast';

export default function LessonEditorPage({ params }: { params: { id: string; lessonId: string } }) {
  const [content, setContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [lessonType, setLessonType] = useState<'VIDEO' | 'ARTICLE' | 'QUIZ'>('ARTICLE');
  const [videoKey, setVideoKey] = useState<string>('');

  // TASK S3-CM-04: Xử lý lưu nội dung Markdown
  const onSave = async () => {
    try {
      setIsSaving(true);
      // Gọi API updateContent đã làm ở Task 3.3
      await axios.patch(`/courses/${params.id}/lessons/${params.lessonId}`, {
        content: lessonType === 'VIDEO' ? videoKey : content,
      });
      toast.success('Đã lưu nội dung bài học');
    } catch (error) {
      toast.error('Lỗi khi lưu nội dung');
    } finally {
      setIsSaving(false);
    }
  };

  // TASK S3-CM-05: Callback sau khi video đã nằm trên S3
  const handleUploadSuccess = async (fileKey: string) => {
    setVideoKey(fileKey);
    toast.success('Video đã được tải lên, hãy lưu bài học để cập nhật!');
  };

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

      {/* Chọn loại bài học */}
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

      {/* Nội dung theo loại bài học */}
      {lessonType === 'VIDEO' ? (
        <div className="space-y-4">
          <p className="text-sm text-gray-500 italic">Tải lên video bài giảng cho học viên.</p>
          <VideoUploader courseId={params.id} onSuccess={handleUploadSuccess} />
          {videoKey && (
            <div className="mt-2 p-2 bg-green-50 text-green-700 rounded-md text-sm">
              ✅ Video đã sẵn sàng: {videoKey.split('/').pop()}
            </div>
          )}
        </div>
      ) : (
        <>
          <MarkdownEditor value={content} onChange={(val) => setContent(val)} />
          <p className="text-xs text-gray-400 italic">
            * Lưu ý: Định dạng Markdown giúp hệ thống AI phân tích và hỗ trợ học tập tốt hơn.
          </p>
        </>
      )}
    </div>
  );
}
