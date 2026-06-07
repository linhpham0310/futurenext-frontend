'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
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
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { restrictToVerticalAxis } from '@dnd-kit/modifiers';
import { useCourseBuilderStore } from '@/store/use-course-builder-store';
import { SortableSectionItem } from './_components/sortable-section-item';
import { toast } from 'sonner';
import { apiClient } from '@/lib/api';

export default function CourseBuilderPage() {
  const params = useParams();
  const courseId = params.id as string;
  const {
    sections,
    setCourseData,
    addSection,
    reorderSections,
    rollbackSections,
    addLesson,
    updateLesson,
    deleteLesson,
  } = useCourseBuilderStore();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [isAddingSection, setIsAddingSection] = useState(false);

  // Load sections từ API builder route
  useEffect(() => {
    if (!courseId) return;
    apiClient
      .get(`/courses/${courseId}/builder`)
      .then((res) => {
        setCourseData(courseId, res.data.sections || []);
      })
      .catch(() => toast.error('Không thể tải danh sách chương'));
  }, [courseId]);

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) return;
    setIsAddingSection(true);
    try {
      const res = await apiClient.post(`/courses/${courseId}/sections`, {
        title: newSectionTitle.trim(),
      });
      addSection({ ...res.data, lessons: [] });
      setNewSectionTitle('');
      setShowAddForm(false);
      toast.success('Đã thêm chương mới');
    } catch {
      toast.error('Không thể thêm chương');
    } finally {
      setIsAddingSection(false);
    }
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderSections(active.id as string, over.id as string);
      const savingToast = toast.loading('Đang lưu thứ tự...');
      try {
        const updatedSections = useCourseBuilderStore.getState().sections;
        const payload = updatedSections.map((section, index) => ({
          id: section.id,
          orderIndex: index + 1,
        }));
        await apiClient.patch(`/courses/${courseId}/sections/reorder`, { orders: payload });
        toast.success('Đã cập nhật thứ tự', { id: savingToast });
      } catch {
        rollbackSections();
        toast.error('Lỗi kết nối. Thứ tự đã được khôi phục.', { id: savingToast });
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
        modifiers={[restrictToVerticalAxis]}
      >
        <SortableContext items={sections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          {sections.map((section) => (
            <SortableSectionItem
              key={section.id}
              id={section.id}
              title={section.title}
              courseId={courseId}
              lessons={section.lessons ?? []}
              onAddLesson={addLesson}
              onUpdateLesson={updateLesson}
              onDeleteLesson={deleteLesson}
            />
          ))}
        </SortableContext>
      </DndContext>
      {sections.length === 0 && !showAddForm && (
        <div className="text-center p-10 border-2 border-dashed rounded-lg text-gray-400">
          Chưa có chương mục nào.
        </div>
      )}
      {showAddForm ? (
        <div className="flex items-center gap-2 mt-4">
          <input
            autoFocus
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddSection();
              if (e.key === 'Escape') setShowAddForm(false);
            }}
            placeholder="Tên chương mới..."
            className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleAddSection}
            disabled={isAddingSection || !newSectionTitle.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:bg-blue-300"
          >
            {isAddingSection ? 'Đang thêm...' : 'Thêm'}
          </button>
          <button
            onClick={() => {
              setShowAddForm(false);
              setNewSectionTitle('');
            }}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:bg-gray-50"
          >
            Hủy
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500 transition text-sm font-medium"
        >
          + Thêm chương mới
        </button>
      )}
    </div>
  );
}
