'use client';
import React from 'react';
import 'easymde/dist/easymde.min.css';
import dynamic from 'next/dynamic';

const SimpleMDE = dynamic(() => import('react-simplemde-editor'), { ssr: false });

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
}
// TASK S3-CM-04: Component soạn thảo Markdown chuẩn hóa dữ liệu cho AI
export const MarkdownEditor = ({ value, onChange }: MarkdownEditorProps) => {
  // Cấu hình các công cụ hiển thị trên toolbar
  const options = React.useMemo(
    () => ({
      spellChecker: false,
      placeholder: 'Nhập nội dung bài giảng bằng Markdown...',
      status: false,
      autosave: {
        enabled: true,
        uniqueId: 'course-content-editor',
        delay: 1000,
      },
      // Chỉ giữ lại các định dạng cơ bản để AI dễ đọc
      toolbar: [
        'bold',
        'italic',
        'heading',
        '|',
        'quote',
        'unordered-list',
        'ordered-list',
        '|',
        'link',
        'code',
        'table',
        '|',
        'preview',
        'side-by-side',
        'fullscreen',
      ] as const,
    }),
    []
  );
  return (
    <div className="markdown-editor-container bg-white rounded-md border">
      <SimpleMDE value={value} onChange={onChange} options={options} />
    </div>
  );
};
