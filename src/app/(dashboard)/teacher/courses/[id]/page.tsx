'use client';
import { useEffect } from 'react';
import { useCourseBuilderStore } from '@/store/use-course-builder-store';
import axios from 'axios';
export default function CourseBuilderPage({ params }: { params: { id: string } }) {
  const { sections, setCourseData, isLoading, setLoading } = useCourseBuilderStore();
  // Task S1-CM-07: Fetch dữ liệu và đẩy vào Zustand khi vào trang
  useEffect(() => {
    const fetchCourse = async () => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/v1/courses/${params.id}`);
        // Giả sử API trả về { id, sections: [...] }
        setCourseData(response.data.id, response.data.sections);
      } catch (error) {
        console.error('Lỗi fetch dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [params.id, setCourseData, setLoading]);
  if (isLoading) return <div>Đang tải cấu trúc khóa học...</div>;
  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Trình xây dựng nội dung</h1>
      {/* Hiển thị danh sách Section từ Store */}
      <div className="space-y-4">
        {sections.map((section) => (
          <div key={section.id} className="p-4 bg-white border rounded-lg shadow-sm">
            <h3 className="font-medium">{section.title}</h3>
            <p className="text-sm text-gray-500">{section.lessons.length} bài học</p>
          </div>
        ))}
        {sections.length === 0 && (
          <p className="text-gray-400 italic">Chưa có chương mục nào. Bắt đầu tạo ở Sprint 2!</p>
        )}
      </div>
    </div>
  );
}
