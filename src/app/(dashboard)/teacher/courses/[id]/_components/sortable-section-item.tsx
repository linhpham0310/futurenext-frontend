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
} from 'lucide-react';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { useCourseBuilderStore } from '@/store/use-course-builder-store';

interface Lesson {
  id: string;
  title: string;
  type: 'VIDEO' | 'ARTICLE' | 'QUIZ';
  orderIndex: number;
}

interface Props {
  id: string;
  title: string;
  courseId: string;
  lessons: Lesson[];
  onAddLesson?: (sectionId: string, lesson: Lesson) => void;
  onUpdateLesson?: (sectionId: string, lessonId: string, data: Partial<Lesson>) => void;
  onDeleteLesson?: (sectionId: string, lessonId: string) => void;
}
const LessonTypeIcon = ({ type }: { type: string }) => {
  if (type === 'VIDEO') return <Video className="h-4 w-4 text-blue-500" />;
  if (type === 'ARTICLE') return <FileText className="h-4 w-4 text-green-500" />;
  return <HelpCircle className="h-4 w-4 text-orange-500" />;
};

export const SortableSectionItem = ({ id, title, courseId, lessons }: Props) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
  });
  const { updateSectionTitle, addLesson } = useCourseBuilderStore();

  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAddLessonForm, setShowAddLessonForm] = useState(false);
  const [newLessonTitle, setNewLessonTitle] = useState('');
  const [newLessonType, setNewLessonType] = useState<'VIDEO' | 'ARTICLE' | 'QUIZ'>('VIDEO');
  const [isAddingLesson, setIsAddingLesson] = useState(false);

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
      await apiClient.patch(`/courses/${courseId}/sections/${id}`, { title: editTitle.trim() });
      updateSectionTitle(id, editTitle.trim());
      setIsEditing(false);
      toast.success('Đã cập nhật tên chương');
    } catch {
      toast.error('Không thể cập nhật tên chương');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddLesson = async () => {
    if (!newLessonTitle.trim()) return;
    setIsAddingLesson(true);
    try {
      const res = await apiClient.post(`/courses/${courseId}/sections/${id}/lessons`, {
        title: newLessonTitle.trim(),
        type: newLessonType,
      });
      addLesson(id, res.data);
      setNewLessonTitle('');
      setShowAddLessonForm(false);
      toast.success('Đã thêm bài học');
    } catch {
      toast.error('Không thể thêm bài học');
    } finally {
      setIsAddingLesson(false);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-md mb-4 shadow-sm"
    >
      {/* Header section */}
      <div className="flex items-center gap-x-2 text-sm">
        <div
          {...attributes}
          {...listeners}
          className="px-2 py-3 border-r border-r-gray-200 hover:bg-gray-100 rounded-l-md transition cursor-grab"
        >
          <GripVertical className="h-5 w-5 text-gray-500" />
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 text-gray-400 hover:text-gray-600"
        >
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </button>
        {isEditing ? (
          <>
            <input
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
              className="flex-1 px-2 py-1 border border-blue-400 rounded text-sm focus:outline-none"
            />
            <button
              onClick={handleSaveTitle}
              disabled={isSaving}
              className="p-1 hover:text-green-600 transition"
            >
              <Check className="h-4 w-4" />
            </button>
            <button
              onClick={() => {
                setIsEditing(false);
                setEditTitle(title);
              }}
              disabled={isSaving}
              className="p-1 hover:text-red-500 transition mr-2"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <>
            <div className="flex-1 px-2 py-3 font-medium text-gray-700">{title}</div>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 hover:text-blue-600 transition mr-2"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Lessons list */}
      {isExpanded && (
        <div className="px-4 pb-3 border-t border-gray-100">
          {lessons.length === 0 && !showAddLessonForm && (
            <p className="text-xs text-gray-400 py-2">Chưa có bài học nào.</p>
          )}
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="flex items-center gap-2 py-2 border-b border-gray-50 last:border-0"
            >
              <LessonTypeIcon type={lesson.type} />
              <span className="flex-1 text-sm text-gray-700">{lesson.title}</span>
              <a
                href={`/teacher/courses/${courseId}/lessons/${lesson.id}`}
                className="text-xs text-blue-500 hover:underline"
              >
                Chỉnh sửa nội dung
              </a>
            </div>
          ))}

          {/* Form thêm bài học */}
          {showAddLessonForm ? (
            <div className="mt-2 flex flex-col gap-2">
              <input
                autoFocus
                value={newLessonTitle}
                onChange={(e) => setNewLessonTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') setShowAddLessonForm(false);
                }}
                placeholder="Tên bài học..."
                className="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <div className="flex items-center gap-2">
                <select
                  value={newLessonType}
                  onChange={(e) => setNewLessonType(e.target.value as 'VIDEO' | 'ARTICLE' | 'QUIZ')}
                  className="p-2 border border-gray-300 rounded text-sm"
                >
                  <option value="VIDEO">Video</option>
                  <option value="ARTICLE">Bài viết</option>
                  <option value="QUIZ">Bài kiểm tra</option>
                </select>
                <button
                  onClick={handleAddLesson}
                  disabled={isAddingLesson || !newLessonTitle.trim()}
                  className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {isAddingLesson ? 'Đang thêm...' : 'Thêm'}
                </button>
                <button
                  onClick={() => {
                    setShowAddLessonForm(false);
                    setNewLessonTitle('');
                  }}
                  className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddLessonForm(true)}
              className="mt-2 flex items-center gap-1 text-xs text-gray-500 hover:text-blue-500 transition"
            >
              <Plus className="h-3 w-3" /> Thêm bài học
            </button>
          )}
        </div>
      )}
    </div>
  );
};
