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
import { SortableSectionItem } from './_components/sortable-section-item';
import { apiClient, teacherApi } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/auth/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { Lesson } from '@/types';

interface Section {
  id: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

export default function CourseBuilderPage() {
  const { id: courseId } = useParams();
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [courseStatus, setCourseStatus] = useState('');

  useEffect(() => {
    if (isTeacher && courseId) {
      // Lấy dữ liệu builder và thông tin course
      Promise.all([
        teacherApi.getCourseBuilder(courseId as string),
        teacherApi.getCourseDetail(courseId as string),
      ])
        .then(([builderRes, courseRes]) => {
          setSections(builderRes.data.sections || []);
          setCourseStatus(courseRes.data.status);
        })
        .catch(() => toast.error('Không thể tải cấu trúc'))
        .finally(() => setLoading(false));
    }
  }, [courseId, isTeacher]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldSections = [...sections];
      const oldIndex = sections.findIndex((s) => s.id === active.id);
      const newIndex = sections.findIndex((s) => s.id === over.id);
      const reordered = [...sections];
      const [moved] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, moved);
      setSections(reordered);
      try {
        const orders = reordered.map((s, idx) => ({ id: s.id, orderIndex: idx + 1 }));
        await teacherApi.reorderSections(courseId as string, orders);
      } catch {
        setSections(oldSections);
        toast.error('Lưu thứ tự thất bại');
      }
    }
  };

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) return;
    setIsAdding(true);
    try {
      const res = await teacherApi.addSection(courseId as string, {
        title: newSectionTitle.trim(),
      });

      setSections([...sections, { ...res.data, lessons: [] }]);
      setNewSectionTitle('');
      setShowAddForm(false);
      toast.success('Thêm chương thành công');
    } catch {
      toast.error('Thêm thất bại');
    } finally {
      setIsAdding(false);
    }
  };

  const handleUpdateSectionTitle = (sectionId: string, newTitle: string) => {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, title: newTitle } : s)));
  };

  if (authLoading || loading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isTeacher) return null;
  if (courseStatus !== 'DRAFT') {
    return (
      <div className="p-6 text-center">
        Khóa học không ở trạng thái nháp, không thể chỉnh sửa cấu trúc.
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h2 className="text-xl font-bold mb-4">Cấu trúc chương học</h2>
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
              courseId={courseId as string}
              lessons={section.lessons}
              onUpdateTitle={handleUpdateSectionTitle}
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
            onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
            placeholder="Tên chương mới..."
            className="flex-1 p-2 border rounded-md"
          />
          <button
            onClick={handleAddSection}
            disabled={isAdding}
            className="px-4 py-2 bg-blue-600 text-white rounded-md"
          >
            Thêm
          </button>
          <button onClick={() => setShowAddForm(false)} className="px-4 py-2 border rounded-md">
            Hủy
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="mt-4 w-full py-2 border-2 border-dashed rounded-lg text-gray-500 hover:border-blue-400 hover:text-blue-500"
        >
          + Thêm chương mới
        </button>
      )}
    </div>
  );
}
