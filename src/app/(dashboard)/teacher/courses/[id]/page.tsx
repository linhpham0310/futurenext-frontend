'use client';
import React from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useCourseBuilderStore } from '@/store/use-course-builder-store'; // Task 1.7 cũ
import { SortableSectionItem } from './_components/sortable-section-item'; // Task 2.4 mới
import axios from 'axios';
export default function CourseBuilderPage({ params }: { params: { id: string } }) {
  const { sections, setCourseData, reorderSections } = useCourseBuilderStore();
  const sensors = useSensors(useSensor(PointerSensor));
  // Task S2-CM-04: Xử lý khi kết thúc kéo thả
  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      // 1. Cập nhật UI ngay lập tức (Optimistic Update từ Task 1.7)
      reorderSections(active.id as string, over.id as string);
      // 2. Lấy danh sách mới từ store sau khi reorder để gửi API
      const updatedSections = useCourseBuilderStore.getState().sections;
      const payload = updatedSections.map((section, index) => ({
        id: section.id,
        orderIndex: index + 1,
      }));
      try {
        // Gọi API Reorder (Task 2.2 Backend)
        await axios.patch(`/api/v1/courses/${params.id}/sections/reorder`, {
          orders: payload,
        });
      } catch (error) {
        console.error('Lỗi đồng bộ thứ tự:', error);
        // Nếu lỗi, bạn nên fetch lại dữ liệu từ server để reset UI
        alert('Không thể lưu thứ tự mới, vui lòng thử lại.');
      }
    }
  };
  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-xl font-bold mb-6">Cấu trúc chương học</h2>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        modifiers={[restrictToVerticalAxis]} // Chỉ cho phép kéo lên xuống
      >
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map((section) => (
            <SortableSectionItem key={section.id} id={section.id} title={section.title} />
          ))}
        </SortableContext>
      </DndContext>
      {sections.length === 0 && (
        <div className="text-center p-10 border-2 border-dashed rounded-lg text-gray-400">
          Chưa có chương mục nào.
        </div>
      )}
    </div>
  );
}
