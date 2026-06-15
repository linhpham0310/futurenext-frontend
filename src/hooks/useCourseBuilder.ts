import { useEffect, useCallback } from 'react';
import { teacherApi } from '@/lib/api';
import { toast } from 'sonner';
import { useCourseBuilderStore } from '@/store/use-course-builder-store';

export function useCourseBuilder(courseId: string) {
  const {
    sections,
    isLoading,
    setCourseData,
    addSection: addSectionToStore,
    updateSectionTitle: updateSectionTitleInStore,
    deleteSection: deleteSectionFromStore,
    reorderSections: reorderSectionsInStore,
    rollbackSections,
    addLesson: addLessonToStore,
    updateLesson: updateLessonInStore,
    deleteLesson: deleteLessonFromStore,
    setLoading,
  } = useCourseBuilderStore();

  // Fetch course builder data
  const fetchCourseData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await teacherApi.getCourseBuilder(courseId);
      setCourseData(courseId, res.data.sections);
    } catch (error: any) {
      toast.error(error?.message || 'Không thể tải dữ liệu khóa học');
    } finally {
      setLoading(false);
    }
  }, [courseId, setCourseData, setLoading]);

  useEffect(() => {
    if (courseId) fetchCourseData();
  }, [courseId, fetchCourseData]);

  // Section operations
  const addSection = async (title: string) => {
    try {
      const res = await teacherApi.addSection(courseId, { title });
      addSectionToStore(res.data);
      toast.success('Đã thêm chương mới');
    } catch (error: any) {
      toast.error(error?.message || 'Thêm chương thất bại');
    }
  };

  const updateSectionTitle = async (sectionId: string, title: string) => {
    const oldTitle = sections.find((s) => s.id === sectionId)?.title;
    updateSectionTitleInStore(sectionId, title); // optimistic
    try {
      await teacherApi.updateSection(courseId, sectionId, { title });
      toast.success('Cập nhật tiêu đề thành công');
    } catch (error: any) {
      updateSectionTitleInStore(sectionId, oldTitle || '');
      toast.error(error?.message || 'Cập nhật thất bại');
    }
  };

  const deleteSection = async (sectionId: string) => {
    const confirm = window.confirm('Xóa chương sẽ xóa toàn bộ bài học bên trong. Tiếp tục?');
    if (!confirm) return;
    const oldSections = [...sections];
    deleteSectionFromStore(sectionId);
    try {
      await teacherApi.deleteSection(courseId, sectionId);
      toast.success('Đã xóa chương');
    } catch (error: any) {
      // rollback
      useCourseBuilderStore.setState({ sections: oldSections });
      toast.error(error?.message || 'Xóa thất bại');
    }
  };

  const reorderSections = async (activeId: string, overId: string) => {
    const activeIndex = sections.findIndex((s) => s.id === activeId);
    const overIndex = sections.findIndex((s) => s.id === overId);
    if (activeIndex === -1 || overIndex === -1) return;
    const newSections = [...sections];
    const [moved] = newSections.splice(activeIndex, 1);
    newSections.splice(overIndex, 0, moved);
    const orders = newSections.map((s, idx) => ({ id: s.id, orderIndex: idx + 1 }));
    reorderSectionsInStore(activeId, overId); // optimistic
    try {
      await teacherApi.reorderSections(courseId, orders);
    } catch (error: any) {
      rollbackSections();
      toast.error(error?.message || 'Sắp xếp thất bại');
    }
  };

  // Lesson operations
  const addLesson = async (sectionId: string, data: any) => {
    try {
      const res = await teacherApi.addLesson(courseId, sectionId, data);
      addLessonToStore(sectionId, res.data);
      toast.success('Đã thêm bài học');
    } catch (error: any) {
      toast.error(error?.message || 'Thêm bài học thất bại');
    }
  };

  const updateLesson = async (sectionId: string, lessonId: string, data: any) => {
    const oldLesson = sections
      .find((s) => s.id === sectionId)
      ?.lessons.find((l) => l.id === lessonId);
    updateLessonInStore(sectionId, lessonId, data);
    try {
      await teacherApi.updateLesson(courseId, lessonId, data);
      toast.success('Cập nhật bài học thành công');
    } catch (error: any) {
      if (oldLesson) updateLessonInStore(sectionId, lessonId, oldLesson);
      toast.error(error?.message || 'Cập nhật thất bại');
    }
  };

  const deleteLesson = async (sectionId: string, lessonId: string) => {
    if (!window.confirm('Xóa bài học này?')) return;
    deleteLessonFromStore(sectionId, lessonId);
    try {
      await teacherApi.deleteLesson(courseId, lessonId);
      toast.success('Đã xóa bài học');
    } catch (error: any) {
      // rollback cần lưu lại lessons cũ -> đơn giản reload lại dữ liệu
      fetchCourseData();
      toast.error(error?.message || 'Xóa thất bại');
    }
  };

  const updateLessonContent = async (lessonId: string, content: string, duration?: number) => {
    try {
      await teacherApi.updateLessonContent(courseId, lessonId, { content, duration });
      toast.success('Đã lưu nội dung');
    } catch (error: any) {
      toast.error(error?.message || 'Lưu nội dung thất bại');
    }
  };

  return {
    sections,
    isLoading,
    addSection,
    updateSectionTitle,
    deleteSection,
    reorderSections,
    addLesson,
    updateLesson,
    deleteLesson,
    updateLessonContent,
  };
}
