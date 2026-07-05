'use client';

import { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Pencil,
  Check,
  X,
  ChevronDown,
  ChevronRight,
  Video,
  FileText,
  HelpCircle,
  Plus,
  Trash2,
} from 'lucide-react';
import { teacherApi } from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface Lesson {
  id: string;
  title: string;
  type: 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'LAB';
  orderIndex: number;
}

interface Props {
  id: string;
  title: string;
  courseId: string;
  lessons: Lesson[];
  onUpdateTitle: (sectionId: string, newTitle: string) => void;
  onDelete: (sectionId: string) => void;
  onToggleMapping?: (outcomeId: string) => void;
  outcomes?: { id: string; title: string }[];
  mappedOutcomes?: string[];
}

const LessonTypeIcon = ({ type }: { type: string }) => {
  if (type === 'VIDEO') return <Video className="h-4 w-4 text-blue-500" />;
  if (type === 'ARTICLE') return <FileText className="h-4 w-4 text-green-500" />;
  if (type === 'QUIZ') return <HelpCircle className="h-4 w-4 text-orange-500" />;
  return <FileText className="h-4 w-4 text-gray-500" />;
};

export const SortableSectionItem = ({
  id,
  title,
  courseId,
  lessons,
  onUpdateTitle,
  onDelete,
}: Props) => {
  const router = useRouter();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddLesson, setShowAddLesson] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<'VIDEO' | 'ARTICLE' | 'QUIZ' | 'LAB'>(
    'ARTICLE'
  );
  const [isAdding, setIsAdding] = useState(false);
  const [localLessons, setLocalLessons] = useState(lessons);

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 100 : 'auto',
    opacity: isDragging ? 0.5 : 1,
  };

  const handleSaveTitle = async () => {
    if (!editTitle.trim() || editTitle === title) {
      setIsEditing(false);
      return;
    }
    setIsSaving(true);
    try {
      await teacherApi.updateSection(courseId, id, { title: editTitle.trim() });
      onUpdateTitle(id, editTitle.trim());
      setIsEditing(false);
      toast.success('Đã cập nhật tên chương');
    } catch {
      toast.error('Lỗi cập nhật');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLesson = async () => {
    if (!newLessonTitle.trim()) return;
    setIsAdding(true);
    try {
      const res = await teacherApi.addLesson(courseId, id, {
        title: newLessonTitle.trim(),
        type: newLessonType,
        duration: 0,
        content: '',
        isFreePreview: false,
      });
      setLocalLessons([...localLessons, res.data]);
      setNewLessonTitle('');
      setShowAddLesson(false);
      toast.success('Thêm bài học thành công');
    } catch {
      toast.error('Thêm thất bại');
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteLesson = async (lessonId: string) => {
    if (!confirm('Xóa bài học này?')) return;
    try {
      await teacherApi.deleteLesson(courseId, lessonId);
      setLocalLessons((prev) => prev.filter((l) => l.id !== lessonId));
      toast.success('Xóa bài học thành công');
    } catch {
      toast.error('Xóa thất bại');
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-md mb-4 shadow-sm"
    >
      <div className="flex items-center gap-x-2 text-sm">
        <div
          {...attributes}
          {...listeners}
          className="px-2 py-3 border-r border-gray-200 hover:bg-gray-100 cursor-grab"
        >
          <GripVertical className="h-5 w-5 text-gray-500" />
        </div>
        <button onClick={() => setIsExpanded(!isExpanded)} className="p-1">
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {isEditing ? (
          <>
            <Input
              autoFocus
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveTitle();
                if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditTitle(title);
                }
              }}
              className="flex-1 h-8 text-sm"
            />
            <button onClick={handleSaveTitle} disabled={isSaving} className="p-1">
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditTitle(title);
              }}
              className="p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <div className="flex-1 px-2 py-3 font-medium">{title}</div>
            <button onClick={() => setIsEditing(true)} className="p-1">
              <Pencil className="h-4 w-4" />
            </button>
            <button onClick={() => onDelete(id)} className="p-1 text-red-500 hover:text-red-700">
              <Trash2 className="h-4 w-4" />
            </button>
          </>
        )}
      </div>
      {isExpanded && (
        <div className="px-4 pb-3 border-t border-gray-100">
          {localLessons.map((lesson) => (
            <div key={lesson.id} className="flex items-center gap-2 py-2 border-b last:border-0">
              <LessonTypeIcon type={lesson.type} />
              <span className="flex-1 text-sm">{lesson.title}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push(`/teacher/courses/${courseId}/lessons/${lesson.id}`)}
              >
                <Pencil className="h-3 w-3 mr-1" /> Sửa nội dung
              </Button>
              <button
                onClick={() => handleDeleteLesson(lesson.id)}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {showAddLesson ? (
            <div className="mt-2 flex flex-col gap-2">
              <Input
                autoFocus
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                placeholder="Tên bài học..."
                className="flex-1"
              />
              <div className="flex gap-2">
                <select
                  value={newLessonType}
                  onChange={(e) => setNewLessonType(e.target.value as any)}
                  className="px-3 py-2 border rounded text-sm"
                >
                  <option value="ARTICLE">Bài viết</option>
                  <option value="VIDEO">Video</option>
                  <option value="QUIZ">Quiz</option>
                  <option value="LAB">Lab</option>
                </select>
                <Button onClick={handleAddLesson} disabled={isAdding} size="sm">
                  {isAdding ? 'Đang thêm...' : 'Thêm'}
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowAddLesson(false)}>
                  Hủy
                </Button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddLesson(true)}
              className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-blue-500"
            >
              <Plus className="h-3 w-3" /> Thêm bài học
            </button>
          )}
        </div>
      )}
    </div>
  );
};
