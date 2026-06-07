// src/app/(dashboard)/teacher/courses/[id]/_components/lesson-editor.tsx
'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { apiClient } from '@/lib/api';
import { toast } from 'sonner';
import { Loader2, FileVideo, FileText } from 'lucide-react';
import { MarkdownEditor } from '@/components/shared/markdown-editor';
import { VideoUploader } from '@/components/shared/video-uploader';

interface Lesson {
  id: string;
  title: string;
  type: 'VIDEO' | 'ARTICLE' | 'QUIZ' | 'LAB';
  content?: string;
}

interface LessonEditorProps {
  open: boolean;
  onClose: () => void;
  courseId: string;
  lesson: Lesson;
  onSave: (updatedLesson: Lesson) => void;
}

export function LessonEditor({ open, onClose, courseId, lesson, onSave }: LessonEditorProps) {
  const [activeTab, setActiveTab] = useState<'content' | 'settings'>('content');
  const [content, setContent] = useState(lesson.content || '');
  const [isSaving, setIsSaving] = useState(false);
  const [videoKey, setVideoKey] = useState(lesson.content || '');

  // Reset when lesson changes
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContent(lesson.content || '');
    setVideoKey(lesson.content || '');
  }, [lesson]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const payload = {
        content: lesson.type === 'VIDEO' ? videoKey : content,
      };
      const response = await apiClient.patch(`/courses/${courseId}/lessons/${lesson.id}`, payload);
      onSave(response.data);
      toast.success('Đã lưu nội dung bài học');
      onClose();
    } catch (error) {
      toast.error('Lưu thất bại');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleVideoUploadSuccess = (fileKey: string) => {
    setVideoKey(fileKey);
    toast.success('Video đã được tải lên, hãy lưu bài học để cập nhật!');
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Chỉnh sửa bài học: {lesson.title}</DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="content">
              {lesson.type === 'VIDEO' ? (
                <FileVideo className="h-4 w-4 mr-2" />
              ) : (
                <FileText className="h-4 w-4 mr-2" />
              )}
              Nội dung
            </TabsTrigger>
            <TabsTrigger value="settings">Cài đặt</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4 pt-4">
            {lesson.type === 'VIDEO' ? (
              <div className="space-y-4">
                <VideoUploader courseId={courseId} onSuccess={handleVideoUploadSuccess} />
                {videoKey && (
                  <div className="p-3 bg-green-50 text-green-700 rounded-md">
                    <p className="text-sm">Video đã sẵn sàng: {videoKey.split('/').pop()}</p>
                  </div>
                )}
              </div>
            ) : lesson.type === 'ARTICLE' ? (
              <div className="space-y-4">
                <MarkdownEditor value={content} onChange={setContent} />
                <p className="text-xs text-gray-400 italic">
                  Định dạng Markdown giúp AI phân tích nội dung tốt hơn.
                </p>
              </div>
            ) : (
              <div className="p-4 bg-yellow-50 text-yellow-700 rounded-md">
                Loại bài học {lesson.type} chưa được hỗ trợ chỉnh sửa nội dung.
              </div>
            )}
          </TabsContent>

          <TabsContent value="settings" className="space-y-4 pt-4">
            <div className="p-4 bg-gray-50 rounded-md">
              <p className="text-sm text-gray-500">
                Các cài đặt nâng cao (thời lượng, xem thử, ...) sẽ được thêm sau.
              </p>
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end gap-2 mt-4">
          <Button variant="outline" onClick={onClose}>
            Hủy
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Lưu thay đổi
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
