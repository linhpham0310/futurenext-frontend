'use client';
import React, { useState, useEffect } from 'react';
import { MarkdownEditor } from '@/components/shared/markdown-editor'; // (NEW - S3-CM-04)
import { useCourseBuilderStore } from '@/store/use-course-builder-store';
import axios from 'axios';
import { toast } from 'react-hot-toast';
export default function LessonEditorPage({ params }: { params: { id: string; lessonId: string } }) {
  const [content, setContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  // TASK S3-CM-04: Xử lý lưu nội dung Markdown
  const onSave = async () => {
    try {
      setIsSaving(true);
      // Gọi API updateContent đã làm ở Task 3.3
      await axios.patch(`/api/v1/courses/${params.id}/lessons/${params.lessonId}`, {
        content: content,
      });
      toast.success('Đã lưu nội dung bài học');
    } catch (error) {
      toast.error('Lỗi khi lưu nội dung');
    } finally {
      setIsSaving(false);
    }
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
      {/* Sử dụng MarkdownEditor Component mới */}
      <MarkdownEditor value={content} onChange={(val) => setContent(val)} />
      <p className="text-xs text-gray-400 italic">
        * Lưu ý: Định dạng Markdown giúp hệ thống AI phân tích và hỗ trợ học tập tốt hơn.
      </p>
    </div>
  );
}
