'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { teacherApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { BackButton } from '@/components/ui/back-button';
import { SelectFromBankDialog } from '@/components/teacher/SelectFromBankDialog';
import { Database } from 'lucide-react';

interface Question {
  id?: string;
  text: string;
  type: 'MCQ' | 'ESSAY';
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

interface QuestionItem {
  id: string;
  type: 'MCQ' | 'ESSAY' | 'CODING';
  questionText: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  difficulty?: string;
  tags: string[];
}

export default function CreateExamPage() {
  const { isTeacher, isLoading: authLoading } = useAuth();
  const router = useRouter();

  const [topic, setTopic] = useState('');
  const [examType, setExamType] = useState<'MCQ' | 'ESSAY' | 'MIXED'>('MCQ');
  const [duration, setDuration] = useState(60);
  const [numQuestions, setNumQuestions] = useState(10);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [bankDialogOpen, setBankDialogOpen] = useState(false);

  const handleGenerate = async () => {
    if (!topic.trim()) {
      toast.error('Vui lòng nhập chủ đề');
      return;
    }
    setGenerating(true);
    try {
      const res = await teacherApi.generateQuiz({
        topic,
        type: examType,
        duration,
        numQuestions,
      });
      setQuestions(res.data.questions);
      toast.success(`Đã sinh ${res.data.questions.length} câu hỏi`);
    } catch (error) {
      toast.error('Tạo câu hỏi thất bại');
    } finally {
      setGenerating(false);
    }
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    const updated = [...questions];
    updated[index] = { ...updated[index], [field]: value };
    setQuestions(updated);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: '',
        type: examType === 'ESSAY' ? 'ESSAY' : 'MCQ',
        options: examType === 'ESSAY' ? undefined : ['', '', '', ''],
        correctAnswer: examType === 'ESSAY' ? undefined : '',
      },
    ]);
  };

  const deleteQuestion = (index: number) => {
    setQuestions(questions.filter((_, i) => i !== index));
  };

  const addQuestionsFromBank = (items: QuestionItem[]) => {
    const newQuestions: Question[] = items.map((q) => ({
      text: q.questionText,
      type: q.type as 'MCQ' | 'ESSAY',
      options: q.options || undefined,
      correctAnswer: q.correctAnswer || undefined,
      explanation: q.explanation || undefined,
    }));
    setQuestions([...questions, ...newQuestions]);
    toast.success(`Đã thêm ${newQuestions.length} câu hỏi từ ngân hàng`);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề cho quiz');
      return;
    }
    if (questions.length === 0) {
      toast.error('Chưa có câu hỏi nào');
      return;
    }
    setSaving(true);
    try {
      await teacherApi.createExam({
        title,
        topic,
        type: examType,
        duration,
        questions,
      });
      toast.success('Lưu quiz thành công');
      router.push('/teacher/exams');
    } catch (error) {
      toast.error('Lưu thất bại');
    } finally {
      setSaving(false);
    }
  };

  if (authLoading)
    return (
      <div className="p-8 flex justify-center">
        <Spinner />
      </div>
    );
  if (!isTeacher) return null;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tạo Quiz với AI</h1>
        <BackButton />
      </div>
      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Tiêu đề Quiz</label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ví dụ: Kiểm tra giữa kỳ - Chương 1"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Chủ đề / Nội dung</label>
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Nhập chủ đề, kiến thức cần kiểm tra..."
              rows={3}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm mb-1">Loại</label>
              <select
                className="w-full p-2 border rounded"
                value={examType}
                onChange={(e) => setExamType(e.target.value as any)}
              >
                <option value="MCQ">Trắc nghiệm</option>
                <option value="ESSAY">Tự luận</option>
                <option value="MIXED">Hỗn hợp</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Thời gian (phút)</label>
              <select
                className="w-full p-2 border rounded"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                <option value={15}>15 phút</option>
                <option value={60}>60 phút</option>
                <option value={120}>120 phút</option>
              </select>
            </div>
            <div>
              <label className="block text-sm mb-1">Số câu hỏi</label>
              <Input
                type="number"
                min={1}
                max={50}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
              />
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={generating} className="w-full">
            {generating ? <Spinner className="h-4 w-4 mr-2" /> : null}
            {generating ? 'AI đang sinh câu hỏi...' : 'Tạo câu hỏi với AI'}
          </Button>
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Danh sách câu hỏi ({questions.length})</h2>
            <div className="flex gap-2">
              <Button variant="outline" onClick={addQuestion}>
                + Thêm câu hỏi
              </Button>
              <Button variant="outline" onClick={() => setBankDialogOpen(true)}>
                <Database className="h-4 w-4 mr-1" /> Từ ngân hàng
              </Button>
            </div>
          </div>
          {questions.map((q, idx) => (
            <Card key={idx}>
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Câu {idx + 1}</span>
                  <button onClick={() => deleteQuestion(idx)} className="text-red-500 text-sm">
                    Xóa
                  </button>
                </div>
                <div>
                  <label className="block text-sm">Nội dung câu hỏi</label>
                  <Textarea
                    value={q.text}
                    onChange={(e) => updateQuestion(idx, 'text', e.target.value)}
                    rows={2}
                  />
                </div>
                {(q.type === 'MCQ' || examType === 'MIXED') && (
                  <div>
                    <label className="block text-sm">Các đáp án (mỗi dòng một đáp án)</label>
                    {q.options?.map((opt, optIdx) => (
                      <Input
                        key={optIdx}
                        value={opt}
                        onChange={(e) => {
                          const newOptions = [...(q.options || [])];
                          newOptions[optIdx] = e.target.value;
                          updateQuestion(idx, 'options', newOptions);
                        }}
                        placeholder={`Đáp án ${String.fromCharCode(65 + optIdx)}`}
                        className="mt-1"
                      />
                    ))}
                    <div className="mt-2">
                      <label className="block text-sm">Đáp án đúng (A, B, C, D)</label>
                      <Input
                        value={q.correctAnswer || ''}
                        onChange={(e) =>
                          updateQuestion(idx, 'correctAnswer', e.target.value.toUpperCase())
                        }
                        placeholder="Ví dụ: A"
                      />
                    </div>
                  </div>
                )}
                {q.type === 'ESSAY' && (
                  <div>
                    <label className="block text-sm">Gợi ý đáp án / thang điểm</label>
                    <Textarea
                      value={q.explanation || ''}
                      onChange={(e) => updateQuestion(idx, 'explanation', e.target.value)}
                      rows={2}
                      placeholder="Hướng dẫn chấm hoặc đáp án mẫu"
                    />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
          <Button onClick={handleSave} disabled={saving} className="w-full">
            {saving ? 'Đang lưu...' : 'Lưu Quiz'}
          </Button>
        </div>
      )}

      <SelectFromBankDialog
        open={bankDialogOpen}
        onOpenChange={setBankDialogOpen}
        onSelect={addQuestionsFromBank}
        existingQuestionIds={questions.map((q) => q.id).filter(Boolean) as string[]}
      />
    </div>
  );
}
