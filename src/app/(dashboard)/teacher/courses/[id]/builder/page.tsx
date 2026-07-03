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
import { teacherApi } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/auth/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { Lesson, LearningOutcome } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { BackButton } from '@/components/ui/back-button';

interface Section {
  id: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
  loMappings?: string[];
}

export default function CourseBuilderPage() {
  const { id: courseId } = useParams();
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [sections, setSections] = useState<Section[]>([]);
  const [outcomes, setOutcomes] = useState<LearningOutcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [courseStatus, setCourseStatus] = useState('');
  const [showAddOutcome, setShowAddOutcome] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSectionTitle, setNewSectionTitle] = useState('');
  const [newOutcomeDesc, setNewOutcomeDesc] = useState('');
  const [isAddingOutcome, setIsAddingOutcome] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [newOutcomeTitle, setNewOutcomeTitle] = useState('');

  useEffect(() => {
    if (isTeacher && courseId) {
      // Lấy dữ liệu builder và thông tin course
      Promise.all([
        teacherApi.getCourseBuilder(courseId as string),
        teacherApi.getCourseDetail(courseId as string),
        teacherApi.getLearningOutcomes(courseId as string),
      ])
        .then(([builderRes, courseRes, outcomesRes]) => {
          setSections(builderRes.data.sections || []);
          setCourseStatus(courseRes.data.status);
          setOutcomes(outcomesRes.data || []);
        })
        .catch(() => toast.error('Không thể tải cấu trúc'))
        .finally(() => setLoading(false));
    }
  }, [courseId, isTeacher]);

  // Hàm thêm LO
  const handleAddOutcome = async () => {
    if (!newOutcomeTitle.trim()) return;
    setIsAddingOutcome(true);
    try {
      const res = await teacherApi.createLearningOutcome(courseId as string, {
        title: newOutcomeTitle.trim(),
        description: newOutcomeDesc.trim(),
      });
      setOutcomes([...outcomes, res.data]);
      setNewOutcomeTitle('');
      setNewOutcomeDesc('');
      setShowAddOutcome(false);
      toast.success('Thêm kết quả học tập thành công');
    } catch {
      toast.error('Thêm thất bại');
    } finally {
      setIsAddingOutcome(false);
    }
  };

  // Hàm xóa LO
  const handleDeleteOutcome = async (outcomeId: string) => {
    if (!confirm('Xóa kết quả học tập này?')) return;
    try {
      await teacherApi.deleteLearningOutcome(courseId as string, outcomeId);

      setOutcomes(outcomes.filter((o) => o.id !== outcomeId));
      toast.success('Xóa thành công');
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  // Hàm cập nhật mapping LO cho section
  const handleToggleMapping = async (sectionId: string, outcomeId: string) => {
    const section = sections.find((s) => s.id === sectionId);
    if (!section) return;
    const currentMappings = section.loMappings || [];
    const isMapped = currentMappings.includes(outcomeId);
    const newMappings = isMapped
      ? currentMappings.filter((id) => id !== outcomeId)
      : [...currentMappings, outcomeId];

    // Optimistic update
    setSections((prev) =>
      prev.map((s) => (s.id === sectionId ? { ...s, loMappings: newMappings } : s))
    );

    try {
      await teacherApi.updateSectionMapping(courseId as string, sectionId, {
        loIds: newMappings,
      });
    } catch {
      // Rollback
      setSections((prev) =>
        prev.map((s) => (s.id === sectionId ? { ...s, loMappings: currentMappings } : s))
      );
      toast.error('Cập nhật mapping thất bại');
    }
  };

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
  if (courseStatus === 'APPROVED') {
    return <div>Khóa học đã được duyệt, không thể chỉnh sửa cấu trúc.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm border">
          <div>
            <h1 className="text-xl font-semibold">Công cụ xây dựng khóa học</h1>
            <p className="text-sm text-gray-500">Quản lý cấu trúc khóa học và mục tiêu học tập</p>
          </div>
          <BackButton />
        </div>
        <Tabs defaultValue="structure" className="w-full">
          <TabsList className="grid grid-cols-2 w-full bg-white p-1 rounded-xl border">
            <TabsTrigger value="structure">📚 Chương & Bài học</TabsTrigger>
            <TabsTrigger value="curriculum">🎯 Mục tiêu học tập</TabsTrigger>
          </TabsList>
          <TabsContent value="structure" className="space-y-4 mt-4">
            <div className="bg-white rounded-xl border shadow-sm p-4">
              {' '}
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
                    />
                  ))}
                </SortableContext>
              </DndContext>
              {sections.length === 0 && !showAddForm && (
                <div className="text-center py-10 border border-dashed rounded-xl bg-white text-gray-400">
                  Chưa có chương nào. Hãy tạo chương đầu tiên.
                </div>
              )}
              {showAddForm ? (
                <div className="flex gap-2 mt-4 bg-gray-50 p-3 rounded-xl border">
                  <input
                    autoFocus
                    value={newSectionTitle}
                    onChange={(e) => setNewSectionTitle(e.target.value)}
                    placeholder="Tên chương..."
                    className="flex-1 px-3 py-2 rounded-lg border focus:outline-none focus:ring-2 focus:ring-blue-400"
                  />

                  <button
                    onClick={handleAddSection}
                    disabled={isAdding}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Thêm
                  </button>

                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Hủy
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 w-full py-3 rounded-xl border border-dashed
             hover:border-blue-400 hover:bg-blue-50
             text-gray-500 hover:text-blue-600 transition"
                >
                  + Thêm chương mới
                </button>
              )}
            </div>
          </TabsContent>

          <TabsContent value="curriculum" className="space-y-6 mt-4">
            <div className="grid gap-6">
              <Card className="rounded-xl border shadow-sm">
                <CardContent className="p-5">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold">Danh sách kết quả học tập</h3>
                    <Button variant="outline" size="sm" onClick={() => setShowAddOutcome(true)}>
                      <Plus className="h-4 w-4 mr-1" /> Thêm
                    </Button>
                  </div>
                  {showAddOutcome && (
                    <div className="border rounded p-3 mb-3 bg-gray-50 space-y-2">
                      <Input
                        placeholder="Tiêu đề  (ví dụ: Hiểu về React Hooks)"
                        value={newOutcomeTitle}
                        onChange={(e) => setNewOutcomeTitle(e.target.value)}
                      />
                      <Input
                        placeholder="Mô tả"
                        value={newOutcomeDesc}
                        onChange={(e) => setNewOutcomeDesc(e.target.value)}
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleAddOutcome} disabled={isAddingOutcome}>
                          {isAddingOutcome ? 'Đang thêm...' : 'Thêm'}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setShowAddOutcome(false);
                            setNewOutcomeTitle('');
                            setNewOutcomeDesc('');
                          }}
                        >
                          Hủy
                        </Button>
                      </div>
                    </div>
                  )}
                  {outcomes.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Chưa có kết quả học tập nào.</p>
                  ) : (
                    <ul className="space-y-2">
                      {outcomes.map((outcome) => (
                        <li
                          key={outcome.id}
                          className="flex justify-between items-center border-b pb-2"
                        >
                          <div>
                            <p className="font-medium">{outcome.title}</p>
                            {outcome.description && (
                              <p className="text-sm text-muted-foreground">{outcome.description}</p>
                            )}
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteOutcome(outcome.id)}
                          >
                            <X className="h-4 w-4 text-red-500" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <h3 className="font-semibold mb-3">Ánh xạ kết quả học tập với Section</h3>
                  {sections.length === 0 ? (
                    <p className="text-muted-foreground text-sm">Chưa có section nào.</p>
                  ) : (
                    sections.map((section) => (
                      <div key={section.id} className="border rounded p-3 mb-3">
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
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
