'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { teacherApi } from '@/lib/api';
import { useAuth } from '@/hooks/auth/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { MarkdownEditor } from '@/components/shared/markdown-editor';
import { VideoUploader } from '@/components/shared/video-uploader';
import { toast } from 'sonner';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { TagInput } from '@/components/shared/tag-input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BackButton } from '@/components/ui/back-button';

export default function LessonEditorPage() {
  const { id: courseId, lessonId } = useParams();
  const router = useRouter();
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [videoKey, setVideoKey] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [courseStatus, setCourseStatus] = useState('');
  const [statusLoading, setStatusLoading] = useState(true); // ✅ Thêm dòng này

  // AI Config
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [aiInstructions, setAiInstructions] = useState('');
  const [aiFaqs, setAiFaqs] = useState('');
  const [mainTopics, setMainTopics] = useState<string[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('');
  const [exams, setExams] = useState<{ id: string; title: string }[]>([]);

  useEffect(() => {
    if (isTeacher && courseId && lessonId) {
      Promise.all([
        teacherApi.getLesson(courseId as string, lessonId as string),
        teacherApi.getExams(), // lấy danh sách đề thi để gán
      ])
        .then(([lessonRes, examsRes]) => {
          const data = lessonRes.data;
          setLesson(data);
          if (data.type === 'VIDEO') setVideoKey(data.content || '');
          else setContent(data.content || '');
          // AI config
          setIsAiEnabled(data.isAiEnabled || false);
          setAiInstructions(data.aiContext?.customInstructions || '');
          setAiFaqs(data.aiContext?.faqs?.join('\n') || '');
          setMainTopics(data.mainTopics || []);
          setSelectedExamId(data.examId || '');
          setExams(examsRes.data || []);
        })
        .catch(() => toast.error('Không tải được bài học'))
        .finally(() => setLoading(false));
    }
  }, [courseId, lessonId, isTeacher]);

  useEffect(() => {
    if (isTeacher && courseId) {
      teacherApi
        .getCourseDetail(courseId as string)
        .then((res) => setCourseStatus(res.data.status))
        .catch(() => {})
        .finally(() => setStatusLoading(false));
    }
  }, [courseId, isTeacher]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: any = {
        content: lesson?.type === 'VIDEO' ? videoKey : content,
        isAiEnabled,
        aiContext: {
          customInstructions: aiInstructions,
          faqs: aiFaqs.split('\n').filter((s) => s.trim()),
        },
        mainTopics,
        examId: selectedExamId || undefined,
      };
      await teacherApi.updateLesson(courseId as string, lessonId as string, payload);
      toast.success('Lưu nội dung thành công');
      router.push(`/teacher/courses/${courseId}/builder`);
    } catch {
      toast.error('Lưu thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  if (authLoading || loading || statusLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  }

  if (!isTeacher) return null;
  if (courseStatus !== 'DRAFT' && courseStatus !== 'REJECTED') {
    return (
      <div className="p-6 text-center">
        Khóa học không ở trạng thái nháp hoặc bị từ chối, không thể chỉnh sửa cấu trúc.
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BackButton />
          <h2 className="text-xl font-bold">Soạn thảo: {lesson.title}</h2>
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Đang lưu...' : 'Lưu nội dung'}
        </Button>
      </div>

      {/* Nội dung chính */}
      <div className="border rounded p-4">
        {lesson.type === 'VIDEO' ? (
          <div>
            <VideoUploader courseId={courseId as string} onSuccess={(key) => setVideoKey(key)} />
            <p className="mt-2 text-sm">Video key: {videoKey}</p>
          </div>
        ) : (
          <MarkdownEditor value={content} onChange={setContent} />
        )}
      </div>

      {/* Cấu hình AI */}
      <div className="border rounded p-4 space-y-4">
        <h3 className="font-semibold">Cấu hình AI Trợ giảng</h3>
        <div className="flex items-center space-x-2">
          <Switch checked={isAiEnabled} onCheckedChange={setIsAiEnabled} />
          <Label>Bật AI Trợ giảng cho bài học này</Label>
        </div>
        <div className="space-y-2">
          <Label>Hướng dẫn tùy chỉnh cho AI</Label>
          <Textarea
            value={aiInstructions}
            onChange={(e) => setAiInstructions(e.target.value)}
            placeholder="Ví dụ: Hãy trả lời học viên theo phong cách thân thiện, chỉ sử dụng kiến thức trong bài học..."
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>FAQ (mỗi dòng một câu hỏi)</Label>
          <Textarea
            value={aiFaqs}
            onChange={(e) => setAiFaqs(e.target.value)}
            placeholder="React Hooks là gì?
useState hoạt động như thế nào?"
            rows={3}
          />
        </div>
        <div className="space-y-2">
          <Label>Chủ đề chính </Label>
          <TagInput tags={mainTopics} onChange={setMainTopics} placeholder="Thêm chủ đề..." />
        </div>
      </div>

      {/* Gán đề thi */}
      {lesson.type === 'QUIZ' && (
        <div className="border rounded p-4 space-y-2">
          <Label>Đề thi gắn với bài học</Label>
          <Select value={selectedExamId} onValueChange={setSelectedExamId}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn đề thi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Không gán</SelectItem>
              {exams.map((exam) => (
                <SelectItem key={exam.id} value={exam.id}>
                  {exam.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Học viên sẽ làm bài thi này sau khi hoàn thành bài học (nếu được cấu hình).
          </p>
        </div>
      )}
    </div>
  );
}
