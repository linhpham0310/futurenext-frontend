'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { teacherApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface Question {
  id?: string;
  text: string;
  type: 'MCQ' | 'ESSAY';
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
}

export default function EditExamPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isTeacher, isLoading: authLoading } = useAuth();

  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [examType, setExamType] = useState<'MCQ' | 'ESSAY' | 'MIXED'>('MCQ');
  const [duration, setDuration] = useState(60);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isTeacher && id) {
      teacherApi
        .getExam(id as string)
        .then((res) => {
          const data = res.data;
          setTitle(data.title);
          setTopic(data.topic);
          setExamType(data.type);
          setDuration(data.duration);
          setQuestions(data.questions);
        })
        .catch(() => toast.error('Không thể tải đề thi'))
        .finally(() => setLoading(false));
    }
  }, [id, isTeacher]);

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

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Vui lòng nhập tiêu đề');
      return;
    }
    if (questions.length === 0) {
      toast.error('Chưa có câu hỏi nào');
      return;
    }
    setSaving(true);
    try {
      await teacherApi.updateExam(id as string, {
        title,
        topic,
        type: examType,
        duration,
        questions,
      });
      toast.success('Cập nhật thành công');
      router.push('/teacher/exams');
    } catch {
      toast.error('Lưu thất bại');
    } finally {
      setSaving(false);
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
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">Chỉnh sửa đề thi</h1>

      <Card>
        <CardContent className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium">Tiêu đề</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium">Chủ đề</label>
            <Textarea value={topic} onChange={(e) => setTopic(e.target.value)} rows={2} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm">Loại đề</label>
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
              <label className="block text-sm">Thời gian (phút)</label>
              <Input
                type="number"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">Danh sách câu hỏi ({questions.length})</h2>
          <Button variant="outline" onClick={addQuestion}>
            + Thêm câu hỏi
          </Button>
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
                <>
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
                  <div>
                    <label className="block text-sm">Đáp án đúng (A, B, C, D)</label>
                    <Input
                      value={q.correctAnswer || ''}
                      onChange={(e) =>
                        updateQuestion(idx, 'correctAnswer', e.target.value.toUpperCase())
                      }
                    />
                  </div>
                </>
              )}
              {q.type === 'ESSAY' && (
                <div>
                  <label className="block text-sm">Gợi ý đáp án</label>
                  <Textarea
                    value={q.explanation || ''}
                    onChange={(e) => updateQuestion(idx, 'explanation', e.target.value)}
                    rows={2}
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
        </Button>
      </div>
    </div>
  );
}
