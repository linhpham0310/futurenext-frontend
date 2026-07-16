'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { teacherApi, courseApi } from '@/lib/api';
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
import { Input } from '@/components/ui/input';
import { File, Upload, X, Link as LinkIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function LessonEditorPage() {
  const { id: courseId, lessonId } = useParams();
  const router = useRouter();
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [lesson, setLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [videoKey, setVideoKey] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [courseStatus, setCourseStatus] = useState('');
  const [statusLoading, setStatusLoading] = useState(true);

  // AI Config
  const [isAiEnabled, setIsAiEnabled] = useState(false);
  const [aiInstructions, setAiInstructions] = useState('');
  const [aiFaqs, setAiFaqs] = useState('');
  const [mainTopics, setMainTopics] = useState<string[]>([]);
  const [selectedExamId, setSelectedExamId] = useState<string>('none');
  const [exams, setExams] = useState<{ id: string; title: string }[]>([]);

  // Attachments (chỉ để hiển thị, không gửi lên backend riêng)
  const [attachments, setAttachments] = useState<{ name: string; url: string; type: string }[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  useEffect(() => {
    if (isTeacher && courseId && lessonId) {
      Promise.all([
        teacherApi.getLesson(courseId as string, lessonId as string),
        teacherApi.getExams(),
      ])
        .then(([lessonRes, examsRes]) => {
          const data = lessonRes.data;
          setLesson(data);
          if (data.type === 'VIDEO') {
            setVideoKey(data.content || '');
            setVideoUrl(data.content || '');
          } else {
            setContent(data.content || '');
          }
          setIsAiEnabled(data.isAiEnabled || false);
          setAiInstructions(data.aiContext?.customInstructions || '');
          setAiFaqs(data.aiContext?.faqs?.join('\n') || '');
          setMainTopics(data.mainTopics || []);
          setSelectedExamId(data.examId || 'none');
          setExams(examsRes.data || []);

          // Lấy file đính kèm từ content (nếu có), parse markdown link
          const fileLinks = extractFileLinks(data.content || '');
          setAttachments(fileLinks);
        })
        .catch((err) => {
          console.error('❌ Lỗi tải bài học:', err);
          toast.error('Không tải được bài học');
        })
        .finally(() => setLoading(false));
    }
  }, [courseId, lessonId, isTeacher]);

  // Hàm trích xuất link file từ markdown
  const extractFileLinks = (text: string): { name: string; url: string; type: string }[] => {
    const regex = /\[📎\s*(.*?)\]\((.*?)\)/g;
    const matches = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      matches.push({ name: match[1], url: match[2], type: 'file' });
    }
    return matches;
  };

  useEffect(() => {
    if (isTeacher && courseId) {
      teacherApi
        .getCourseDetail(courseId as string)
        .then((res) => setCourseStatus(res.data.status))
        .catch(() => {})
        .finally(() => setStatusLoading(false));
    }
  }, [courseId, isTeacher]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 50 * 1024 * 1024) {
      toast.error('File không được vượt quá 50MB');
      return;
    }

    setUploadingFile(true);
    try {
      const uploadData = await courseApi.getUploadUrl(courseId as string, file.name, file.type);
      console.log('📦 Upload data:', uploadData);

      // Lấy URL upload từ response (có thể là uploadUrl hoặc url)
      const uploadUrl = uploadData.uploadUrl || uploadData.url;
      if (!uploadUrl) {
        throw new Error('Không nhận được URL upload từ server');
      }

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload response error:', errorText);
        throw new Error(`Upload failed: ${response.status}`);
      }

      // Lấy public URL (thường là URL không có query params)
      const publicUrl = uploadData.publicUrl || uploadUrl.split('?')[0];
      console.log('✅ Public URL:', publicUrl);

      // Thêm vào danh sách attachments
      const newAttachment = { name: file.name, url: publicUrl, type: file.type };
      setAttachments((prev) => [...prev, newAttachment]);

      // Thêm link vào content (dạng markdown)
      if (lesson?.type !== 'VIDEO') {
        const fileLink = `\n\n[📎 ${file.name}](${publicUrl})`;
        setContent((prev) => prev + fileLink);
      }

      toast.success('Upload file thành công');
    } catch (error) {
      console.error('❌ Upload error:', error);
      toast.error(error instanceof Error ? error.message : 'Upload file thất bại');
    } finally {
      setUploadingFile(false);
      e.target.value = '';
    }
  };

  const removeAttachment = (index: number) => {
    const fileToRemove = attachments[index];
    setAttachments((prev) => prev.filter((_, i) => i !== index));
    // Xóa link khỏi content
    if (fileToRemove) {
      const linkPattern = `[📎 ${fileToRemove.name}](${fileToRemove.url})`;
      setContent((prev) => prev.replace(linkPattern, '').replace(/\n\n/g, '\n'));
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload: any = {
        content: lesson?.type === 'VIDEO' ? videoUrl || videoKey : content,
        isAiEnabled,
        aiContext: {
          customInstructions: aiInstructions,
          faqs: aiFaqs.split('\n').filter((s) => s.trim()),
        },
        mainTopics,
        examId: selectedExamId === 'none' ? undefined : selectedExamId,
      };

      console.log('📤 Saving lesson payload:', payload);

      await teacherApi.updateLesson(courseId as string, lessonId as string, payload);
      toast.success('Lưu nội dung thành công');
      router.push(`/teacher/courses/${courseId}/builder`);
    } catch (error: any) {
      console.error('❌ Save error:', error);
      const msg = error?.response?.data?.message || error?.message || 'Lưu thất bại';
      toast.error(msg);
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

  const isVideo = lesson?.type === 'VIDEO';
  const isQuiz = lesson?.type === 'QUIZ';
  const isLab = lesson?.type === 'LAB';
  const isArticle = lesson?.type === 'ARTICLE';

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BackButton />
          <h2 className="text-xl font-bold">Soạn thảo: {lesson.title}</h2>
          <Badge variant="outline" className="ml-2">
            {lesson.type}
          </Badge>
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? 'Đang lưu...' : 'Lưu nội dung'}
        </Button>
      </div>

      {/* Nội dung chính */}
      <div className="border rounded p-4">
        {isVideo ? (
          <div className="space-y-3">
            <VideoUploader
              courseId={courseId as string}
              onSuccess={(key) => {
                setVideoKey(key);
                setVideoUrl(key);
              }}
            />
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Hoặc nhập link video (URL)..."
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                className="flex-1"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Có thể upload video hoặc nhập link video từ bên ngoài.
            </p>
          </div>
        ) : (
          <MarkdownEditor value={content} onChange={setContent} />
        )}
      </div>

      {/* Upload file đính kèm (cho ARTICLE, QUIZ, LAB) */}
      {!isVideo && (
        <div className="border rounded p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Tài liệu đính kèm</h3>
            <div className="flex items-center gap-2">
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg border border-blue-200 hover:bg-blue-100 transition"
              >
                <Upload className="h-4 w-4" />
                <span className="text-sm">Upload file</span>
                <input
                  id="file-upload"
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  disabled={uploadingFile}
                />
              </label>
              {uploadingFile && <Spinner className="h-4 w-4" />}
            </div>
          </div>

          {attachments.length === 0 ? (
            <p className="text-sm text-muted-foreground">Chưa có file đính kèm.</p>
          ) : (
            <div className="space-y-2">
              {attachments.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-gray-50 rounded-lg border"
                >
                  <div className="flex items-center gap-2">
                    <File className="h-4 w-4 text-blue-500" />
                    <a
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:underline truncate max-w-xs"
                    >
                      {file.name}
                    </a>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAttachment(idx)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4 text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}
          <p className="text-xs text-muted-foreground">
            Hỗ trợ file zip, pdf, word, excel, ... tối đa 50MB.
          </p>
        </div>
      )}

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
          <Label>Chủ đề chính</Label>
          <TagInput tags={mainTopics} onChange={setMainTopics} placeholder="Thêm chủ đề..." />
        </div>
      </div>

      {/* Gán đề thi */}
      {isQuiz && (
        <div className="border rounded p-4 space-y-2">
          <Label>Đề thi gắn với bài học</Label>
          <Select value={selectedExamId} onValueChange={setSelectedExamId}>
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
          <p className="text-xs text-muted-foreground">
            Học viên sẽ làm bài thi này sau khi hoàn thành bài học (nếu được cấu hình).
          </p>
        </div>
      )}
    </div>
  );
}
