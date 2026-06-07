'use client';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { ReviewActionForm } from './_components/review-action-form';
import { BookOpen, Video, FileText } from 'lucide-react';

interface Lesson {
  id: string;
  title: string;
  type: 'VIDEO' | 'ARTICLE' | 'QUIZ';
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  outcomes?: string[];
  sections: Section[];
}

export default function AdminReviewPage({ params }: { params: { id: string } }) {
  const [course, setCourse] = useState<CourseDetail | null>(null);
  useEffect(() => {
    const loadDetail = async () => {
      const { data } = await axios.get<CourseDetail>(`/courses/${params.id}/admin-detail`);
      setCourse(data);
    };
    loadDetail();
  }, [params.id]);
  if (!course) return <div>Đang tải nội dung review...</div>;
  return (
    <div className="pb-32 px-6 max-w-5xl mx-auto">
      {/* Header Read-only */}
      <div className="mb-8 border-b pb-4">
        <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded">
          PENDING REVIEW
        </span>
        <h1 className="text-3xl font-bold mt-2">{course.title}</h1>
        <p className="text-gray-500 mt-2">{course.description}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Cấu trúc khóa học (Read-only) */}
        <div className="md:col-span-2 space-y-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <BookOpen className="text-blue-600" /> Nội dung bài giảng
          </h2>
          {course.sections.map((section: Section) => (
            <div key={section.id} className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-bold mb-3">Chương: {section.title}</h3>
              <div className="space-y-2">
                {section.lessons.map((lesson: Lesson) => (
                  <div
                    key={lesson.id}
                    className="flex items-center justify-between p-3 bg-white border rounded"
                  >
                    <div className="flex items-center gap-2">
                      {lesson.type === 'VIDEO' ? <Video size={16} /> : <FileText size={16} />}
                      <span className="text-sm">{lesson.title}</span>
                    </div>
                    {/* Hiển thị nội dung xem trước nhanh */}
                    <span className="text-xs text-blue-500 italic">Read-only content</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Thông tin bổ trợ (Outcomes/Metadata) */}
        <div className="space-y-6">
          <div className="p-4 border rounded-lg shadow-sm">
            <h3 className="font-bold text-sm mb-4">Kết quả đầu ra (Outcomes)</h3>
            <ul className="text-sm space-y-2 list-disc pl-4 text-gray-600">
              {course.outcomes?.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      {/* Task S4-CM-06: Tích hợp thanh công cụ phê duyệt */}
      <ReviewActionForm courseId={params.id} />
    </div>
  );
}
