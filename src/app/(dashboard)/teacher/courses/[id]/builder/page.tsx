'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
import { teacherApi } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/auth/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { BackButton } from '@/components/ui/back-button';

interface Lesson {
  id: string;
  title: string;
  type: 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'LAB';
  orderIndex: number;
  content?: string;
  duration?: number;
  isFreePreview: boolean;
}

interface Section {
  id: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

export default function CourseBuilderPage() {
  const { id: courseId } = useParams();
  const router = useRouter();
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseStatus, setCourseStatus] = useState('');
  const [showAddSection, setShowAddSection] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [isAddingSection, setIsAddingSection] = useState(false);

  useEffect(() => {
    if (!authLoading && !isTeacher) router.push('/forbidden');
  }, [isTeacher, authLoading, router]);

  useEffect(() => {
    if (isTeacher && courseId) {
      Promise.all([
        teacherApi.getCourseBuilder(courseId as string),
        teacherApi.getCourseDetail(courseId as string),
      ])
        .then(([builderRes, courseRes]) => {
          setSections(builderRes.data.sections || []);
          setCourseStatus(courseRes.data.status);
        })
        .catch(() => toast.error('Không thể tải cấu trúc khóa học'))
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
        toast.error('Sắp xếp thất bại');
      }
    }
  };

  const handleAddSection = async () => {
    if (!newSectionTitle.trim()) {
      toast.error('Vui lòng nhập tên chương');
      return;
    }
    setIsAddingSection(true);
    try {
      const res = await teacherApi.addSection(courseId as string, {
        title: newSectionTitle.trim(),
      });
      setSections([...sections, { ...res.data, lessons: [] }]);
      setNewSectionTitle('');
      setShowAddSection(false);
      toast.success('Thêm chương thành công');
    } catch {
      toast.error('Thêm chương thất bại');
    } finally {
      setIsAddingSection(false);
    }
  };

  const handleUpdateSectionTitle = (sectionId: string, newTitle: string) => {
    setSections((prev) => prev.map((s) => (s.id === sectionId ? { ...s, title: newTitle } : s)));
  };

  const handleDeleteSection = async (sectionId: string) => {
    if (!confirm('Xóa chương này?')) return;
    try {
      await teacherApi.deleteSection(courseId as string, sectionId);
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
      toast.success('Xóa chương thành công');
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }
  if (!isTeacher) return null;
  if (courseStatus === 'APPROVED') {
    return (
      <div className="p-6 text-center">Khóa học đã được duyệt, không thể chỉnh sửa cấu trúc.</div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4 mb-6">
        <BackButton />
        <h2 className="text-2xl font-bold">Chỉnh sửa cấu trúc khóa học</h2>
      </div>

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
              onDelete={handleDeleteSection}
            />
          ))}
        </SortableContext>
      </DndContext>

      {showAddSection ? (
        <div className="flex items-center gap-2 mt-4">
          <Input
            autoFocus
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddSection()}
            placeholder="Tên chương mới..."
            className="flex-1"
          />
          <Button onClick={handleAddSection} disabled={isAddingSection}>
            {isAddingSection ? 'Đang thêm...' : 'Thêm'}
          </Button>
          <Button variant="outline" onClick={() => setShowAddSection(false)}>
            Hủy
          </Button>
        </div>
      ) : (
        <Button
          variant="outline"
          className="w-full mt-4 border-dashed"
          onClick={() => setShowAddSection(true)}
        >
          <Plus className="h-4 w-4 mr-1" /> Thêm chương mới
        </Button>
      )}
    </div>
  );
}
