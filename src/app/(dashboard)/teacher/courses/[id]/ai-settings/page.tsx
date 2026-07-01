'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { teacherApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Bot, Sparkles, Loader2 } from 'lucide-react';

interface AISettings {
  isAiEnabled: boolean;
  systemPrompt: string;
  tone: 'professional' | 'friendly' | 'casual';
  autoGenerateOutline: boolean;
  autoGenerateQuiz: boolean;
}

export default function CourseAISettingsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [generatingOutline, setGeneratingOutline] = useState(false);
  const [settings, setSettings] = useState<AISettings>({
    isAiEnabled: true,
    systemPrompt: '',
    tone: 'professional',
    autoGenerateOutline: false,
    autoGenerateQuiz: false,
  });

  useEffect(() => {
    if (isTeacher && id) {
      teacherApi
        .getCourseAISettings(id as string)
        .then((res) => setSettings(res.data))
        .catch(() => toast.error('Không thể tải cấu hình AI'))
        .finally(() => setLoading(false));
    }
  }, [id, isTeacher]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await teacherApi.updateCourseAISettings(id as string, settings);
      toast.success('Cập nhật cấu hình AI thành công');
    } catch {
      toast.error('Cập nhật thất bại');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateOutline = async () => {
    setGeneratingOutline(true);
    try {
      const res = await teacherApi.generateCourseOutline(id as string);
      toast.success('AI đã tạo outline, hãy kiểm tra trong phần Builder');
      router.push(`/teacher/courses/${id}/builder`);
    } catch {
      toast.error('Tạo outline thất bại');
    } finally {
      setGeneratingOutline(false);
    }
  };

  if (authLoading || loading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isTeacher) return null;

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-2">
        <Bot className="h-6 w-6 text-blue-500" />
        <h1 className="text-2xl font-bold">Cấu hình AI Trợ giảng</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>AI Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Bật AI Trợ giảng cho khóa học</Label>
              <p className="text-sm text-muted-foreground">Học viên sẽ được hỗ trợ bởi AI 24/7</p>
            </div>
            <Switch
              checked={settings.isAiEnabled}
              onCheckedChange={(v) => setSettings({ ...settings, isAiEnabled: v })}
            />
          </div>

          <div>
            <Label>System Prompt (Hướng dẫn cho AI)</Label>
            <Textarea
              value={settings.systemPrompt}
              onChange={(e) => setSettings({ ...settings, systemPrompt: e.target.value })}
              placeholder="Ví dụ: Bạn là trợ giảng AI cho khóa học React. Hãy trả lời bằng tiếng Việt, thân thiện, và chỉ dựa trên nội dung khóa học."
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">Hướng dẫn AI cách trả lời học viên</p>
          </div>

          <div>
            <Label>Phong cách trả lời</Label>
            <select
              className="w-full p-2 border rounded"
              value={settings.tone}
              onChange={(e) => setSettings({ ...settings, tone: e.target.value as any })}
            >
              <option value="professional">Chuyên nghiệp</option>
              <option value="friendly">Thân thiện</option>
              <option value="casual">Giản dị</option>
            </select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Tự động sinh nội dung</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Tự động sinh Outline</Label>
              <p className="text-sm text-muted-foreground">AI sẽ đề xuất cấu trúc khóa học</p>
            </div>
            <Switch
              checked={settings.autoGenerateOutline}
              onCheckedChange={(v) => setSettings({ ...settings, autoGenerateOutline: v })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Tự động sinh Quiz</Label>
              <p className="text-sm text-muted-foreground">AI sẽ tạo câu hỏi cho mỗi bài học</p>
            </div>
            <Switch
              checked={settings.autoGenerateQuiz}
              onCheckedChange={(v) => setSettings({ ...settings, autoGenerateQuiz: v })}
            />
          </div>

          <Button onClick={handleGenerateOutline} disabled={generatingOutline} className="w-full">
            {generatingOutline ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang tạo...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" /> Tạo Outline bằng AI ngay
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} className="w-full">
        {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
      </Button>
    </div>
  );
}
