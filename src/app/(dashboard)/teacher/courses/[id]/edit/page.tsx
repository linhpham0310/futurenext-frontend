'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { teacherApi } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TagInput } from '@/components/shared/tag-input';
import { MarkdownEditor } from '@/components/shared/markdown-editor';
import { VideoUploader } from '@/components/shared/video-uploader';
import { toast } from 'sonner';
import { Save, ArrowLeft } from 'lucide-react';

interface LessonData {
  id: string;
  title: string;
  type: 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'LAB';
  content: string;
  duration: number;
  isFreePreview: boolean;
  isAiEnabled: boolean;
  aiContext: { customInstructions?: string; faqs?: string[] };
  mainTopics: string[];
  examId: string | null;
}

export default function LessonEditorPage() {
  const { id: courseId, lessonId } = useParams();
  const router = useRouter();
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [exams, setExams] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    if (!authLoading && !isTeacher) router.push('/forbidden');
  }, [isTeacher, authLoading, router]);

  useEffect(() => {
    if (isTeacher && courseId && lessonId) {
      Promise.all([
        teacherApi.getLesson(courseId as string, lessonId as string),
        teacherApi.getExams(),
      ])
        .then(([lessonRes, examsRes]) => {
          const data = lessonRes.data;
          setLesson({
            id: data.id,
            title: data.title,
            type: data.type,
            content: data.content || '',
            duration: data.duration || 0,
            isFreePreview: data.isFreePreview || false,
            isAiEnabled: data.isAiEnabled ?? false,
            aiContext: data.aiContext || { customInstructions: '', faqs: [] },
            mainTopics: data.mainTopics || [],
            examId: data.examId || null,
          });
          setExams(examsRes.data || []);
        })
        .catch(() => toast.error('Không thể tải bài học'))
        .finally(() => setLoading(false));
    }
  }, [courseId, lessonId, isTeacher]);

  const handleSave = async () => {
    if (!lesson) return;
    setSaving(true);
    try {
      await teacherApi.updateLesson(courseId as string, lessonId as string, {
        content: lesson.content,
        duration: lesson.duration,
        isAiEnabled: lesson.isAiEnabled,
        aiContext: lesson.aiContext,
        mainTopics: lesson.mainTopics,
        examId: lesson.examId || undefined,
        isFreePreview: lesson.isFreePreview,
      });
      toast.success('Lưu bài học thành công');
      router.push(`/teacher/courses/${courseId}/builder`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }
  if (!isTeacher || !lesson) return null;

  const updateLesson = (field: keyof LessonData, value: any) => {
    setLesson((prev) => (prev ? { ...prev, [field]: value } : null));
  };

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <BackButton />
        <h1 className="text-2xl font-bold">Soạn thảo bài học: {lesson.title}</h1>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Thông tin cơ bản */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Tiêu đề</Label>
              <Input value={lesson.title} disabled />
            </div>
            <div>
              <Label>Loại</Label>
              <Input value={lesson.type} disabled />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={lesson.isFreePreview}
                onCheckedChange={(val) => updateLesson('isFreePreview', val)}
              />
              <Label>Xem thử miễn phí</Label>
            </div>
            <div>
              <Label>Thời lượng (phút)</Label>
              <Input
                type="number"
                min={0}
                value={lesson.duration}
                onChange={(e) => updateLesson('duration', Number(e.target.value))}
                className="w-24"
              />
            </div>
          </div>

          {/* Nội dung */}
          <div>
            <Label>Nội dung</Label>
            {lesson.type === 'VIDEO' ? (
              <VideoUploader
                courseId={courseId as string}
                onSuccess={(fileKey) => updateLesson('content', fileKey)}
              />
            ) : (
              <MarkdownEditor
                value={lesson.content}
                onChange={(val) => updateLesson('content', val)}
              />
            )}
          </div>

          {/* Cấu hình AI */}
          <div className="border-t pt-4 space-y-4">
            <h3 className="font-semibold">Cấu hình AI Trợ giảng</h3>
            <div className="flex items-center gap-2">
              <Switch
                checked={lesson.isAiEnabled}
                onCheckedChange={(val) => updateLesson('isAiEnabled', val)}
              />
              <Label>Bật AI cho bài học này</Label>
            </div>
            <div>
              <Label>Hướng dẫn tùy chỉnh</Label>
              <Textarea
                value={lesson.aiContext.customInstructions || ''}
                onChange={(e) =>
                  updateLesson('aiContext', {
                    ...lesson.aiContext,
                    customInstructions: e.target.value,
                  })
                }
                placeholder="Ví dụ: Hãy trả lời học viên bằng tiếng Việt, thân thiện..."
                rows={3}
              />
            </div>
            <div>
              <Label>FAQ (mỗi dòng một câu hỏi)</Label>
              <Textarea
                value={(lesson.aiContext.faqs || []).join('\n')}
                onChange={(e) =>
                  updateLesson('aiContext', {
                    ...lesson.aiContext,
                    faqs: e.target.value.split('\n').filter((s) => s.trim()),
                  })
                }
                placeholder="React Hooks là gì?
useState hoạt động như thế nào?"
                rows={3}
              />
            </div>
            <div>
              <Label>Chủ đề chính (Main Topics)</Label>
              <TagInput
                tags={lesson.mainTopics}
                onChange={(tags) => updateLesson('mainTopics', tags)}
                placeholder="Thêm chủ đề..."
              />
            </div>
            {lesson.type === 'QUIZ' && (
              <div>
                <Label>Gán đề thi</Label>
                <Select
                  value={lesson.examId || 'none'}
                  onValueChange={(val) => updateLesson('examId', val === 'none' ? null : val)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn đề thi" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Không gán</SelectItem>
                    {exams.map((exam) => (
                      <SelectItem key={exam.id} value={exam.id}>
                        {exam.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-1" />
              {saving ? 'Đang lưu...' : 'Lưu bài học'}
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push(`/teacher/courses/${courseId}/builder`)}
            >
              Quay lại Builder
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
