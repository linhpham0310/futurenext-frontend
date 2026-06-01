'use client';
import React from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  KeyboardSensor,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useCourseBuilderStore } from '@/store/use-course-builder-store'; // Task 1.7 cũ
import { SortableSectionItem } from './_components/sortable-section-item'; // Task 2.4 mới
import axios from 'axios';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';
export default function CourseBuilderPage({ params }: { params: { id: string } }) {
  const { sections, reorderSections, rollbackSections } = useCourseBuilderStore();
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      // 1. [OPTIMISTIC UPDATE] - Cập nhật UI ngay lập tức
      reorderSections(active.id as string, over.id as string);
      // Hiển thị trạng thái đang lưu (không chặn người dùng)
      const savingToast = toast.loading('Đang lưu thứ tự...');
      try {
        // Lấy danh sách mới nhất từ Store sau khi vừa reorder xong
        const updatedSections = useCourseBuilderStore.getState().sections;
        const payload = updatedSections.map((section, index) => ({
          id: section.id,
          orderIndex: index + 1, // Cập nhật lại index theo vị trí mới
        }));
        // 2. [API CALL] - Gửi yêu cầu lưu ngầm xuống Backend
        await apiClient.patch(`/courses/${params.id}/sections/reorder`, {
          orders: payload,
        });
        toast.success('Đã cập nhật thứ tự', { id: savingToast });
      } catch (error) {
        // 3. [ROLLBACK] - Nếu Backend lỗi, trả giao diện về trạng thái cũ
        rollbackSections();
        toast.error('Lỗi kết nối. Thứ tự đã được khôi phục.', { id: savingToast });
        console.error('Optimistic Update Error:', error);
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
