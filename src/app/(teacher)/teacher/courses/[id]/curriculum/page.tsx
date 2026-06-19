// src/app/(dashboard)/teacher/courses/[id]/curriculum/page.tsx
'use client';

import { useCourseBuilderStore } from '@/store/use-course-builder-store';
import { TagInput } from '@/components/shared/tag-input';
import { teacherApi } from '@/lib/api';
import { toast } from 'sonner';

interface Lesson {
  id: string;
  title: string;
  type: string;
  aiMetadata?: { keyConcepts?: string[] };
}

export default function CurriculumMappingPage({ params }: { params: { id: string } }) {
  const { sections } = useCourseBuilderStore();

  const handleUpdateTags = async (lessonId: string, concepts: string[]) => {
    try {
      await teacherApi.updateLesson(params.id, lessonId, { keyConcepts: concepts });

      toast.success('Đã cập nhật AI Metadata');
    } catch (error) {
      toast.error('Lỗi cập nhật');
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Curriculum Mapping (AI-Ready)</h1>
        <p className="text-gray-500 text-sm">
          Gắn các khái niệm chính cho từng bài học để AI có thể hỗ trợ học viên tốt nhất.
        </p>
      </header>
      <div className="space-y-6">
        {sections.map((section) => (
          <div key={section.id} className="border rounded-xl p-4 bg-white shadow-sm">
            <h2 className="font-bold text-gray-700 mb-4 border-b pb-2">📦 {section.title}</h2>
            <div className="space-y-4">
              {section.lessons.map((lesson: Lesson) => (
                <div
                  key={lesson.id}
                  className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start p-3 border-l-4 border-blue-500 bg-gray-50 rounded-r-md"
                >
                  <div>
                    <p className="font-semibold text-sm">{lesson.title}</p>
                    <span className="text-[10px] bg-gray-200 px-1 rounded uppercase">
                      {lesson.type}
                    </span>
                  </div>
                  <TagInput
                    tags={lesson.aiMetadata?.keyConcepts || []}
                    onChange={(newTags) => handleUpdateTags(lesson.id, newTags)}
                    placeholder="Gắn concept (VD: React Hooks...)"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
