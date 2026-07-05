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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, X, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { BackButton } from '@/components/ui/back-button';

interface LearningOutcome {
  id: string;
  title: string;
  description?: string;
}

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
  loMappings?: string[];
}

export default function CourseBuilderPage() {
  const { id: courseId } = useParams();
  const router = useRouter();
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [outcomes, setOutcomes] = useState<LearningOutcome[]>([]);
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
        teacherApi.getLearningOutcomes(courseId as string),
        teacherApi.getCourseDetail(courseId as string),
      ])
        .then(([builderRes, outcomesRes, courseRes]) => {
          setSections(builderRes.data.sections || []);
          setOutcomes(outcomesRes.data || []);
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

  const handleToggleMapping = async (sectionId: string, outcomeId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;
    const currentMappings = section.loMappings || [];
    const isMapped = currentMappings.includes(outcomeId);
    const newMappings = isMapped
      ? currentMappings.filter((id) => id !== outcomeId)
      : [...currentMappings, outcomeId];

    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, loMappings: newMappings } : s))
    );

    try {
      await teacherApi.updateSectionMapping(courseId as string, sectionId, {
        loIds: newMappings,
      });
    } catch {
      setSections((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, loMappings: currentMappings } : s))
      );
      toast.error('Cập nhật mapping thất bại');
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

      <Tabs defaultValue="structure">
        <TabsList>
          <TabsTrigger value="structure">Chương & Bài học</TabsTrigger>
          <TabsTrigger value="mapping">Ánh xạ Learning Outcomes</TabsTrigger>
        </TabsList>

        <TabsContent value="structure">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd}
            modifiers={[restrictToVerticalAxis]}
          >
            <SortableContext
              items={sections.map((s) => s.id)}
              strategy={verticalListSortingStrategy}
            >
              {sections.map((section) => (
                <SortableSectionItem
                  key={section.id}
                  id={section.id}
                  title={section.title}
                  courseId={courseId as string}
                  lessons={section.lessons}
                  onUpdateTitle={handleUpdateSectionTitle}
                  onDelete={handleDeleteSection}
                  onToggleMapping={(outcomeId) => handleToggleMapping(section.id, outcomeId)}
                  outcomes={outcomes}
                  mappedOutcomes={section.loMappings || []}
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
        </TabsContent>

        <TabsContent value="mapping">
          <Card>
            <CardContent className="p-4 space-y-4">
              <h3 className="font-semibold">Ánh xạ Learning Outcomes với Section</h3>
              {sections.length === 0 ? (
                <p className="text-muted-foreground">Chưa có section nào.</p>
              ) : (
                sections.map((section) => (
                  <div key={section.id} className="border rounded p-3">
                    <p className="font-medium">{section.title}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {outcomes.map((outcome) => {
                        const isMapped = (section.loMappings || []).includes(outcome.id);
                        return (
                          <button
                            key={outcome.id}
                            onClick={() => handleToggleMapping(section.id, outcome.id)}
                            className={`px-2 py-1 text-xs rounded-full border ${
                              isMapped
                                ? 'bg-blue-100 border-blue-300 text-blue-700'
                                : 'bg-gray-50 border-gray-300 text-gray-500 hover:bg-gray-100'
                            }`}
                          >
                            {isMapped ? '✓ ' : ''}
                            {outcome.title}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
