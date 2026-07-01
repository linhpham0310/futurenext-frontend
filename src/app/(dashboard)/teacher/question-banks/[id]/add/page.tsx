'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { teacherApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { BackButton } from '@/components/ui/back-button';

type QuestionType = 'MCQ' | 'ESSAY' | 'CODING';

export default function AddQuestionToBankPage() {
  const { id } = useParams();
  const router = useRouter();
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [type, setType] = useState<QuestionType>('MCQ');
  const [questionText, setQuestionText] = useState('');
  const [options, setOptions] = useState(['', '', '', '']);
  const [correctAnswer, setCorrectAnswer] = useState('');
  const [explanation, setExplanation] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [tags, setTags] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      toast.error('Vui lòng nhập nội dung câu hỏi');
      return;
    }
    const payload: any = {
      type,
      questionText: questionText.trim(),
      explanation: explanation.trim() || undefined,
      difficulty,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    };
    if (type === 'MCQ') {
      const filteredOptions = options.filter((o) => o.trim());
      if (filteredOptions.length < 2) {
        toast.error('Cần ít nhất 2 lựa chọn');
        return;
      }
      payload.options = filteredOptions;
      if (!correctAnswer) {
        toast.error('Vui lòng chọn đáp án đúng');
        return;
      }
      payload.correctAnswer = correctAnswer;
    }
    setSubmitting(true);
    try {
      await teacherApi.addQuestionItem(id as string, payload);
      toast.success('Thêm câu hỏi thành công');
      router.push(`/teacher/question-banks/${id}`);
    } catch {
      toast.error('Thêm thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading)
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  if (!isTeacher) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Thêm câu hỏi vào ngân hàng</h1>
        <BackButton />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Thông tin câu hỏi</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Loại câu hỏi</Label>
              <Select value={type} onValueChange={(v) => setType(v as QuestionType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MCQ">Trắc nghiệm</SelectItem>
                  <SelectItem value="ESSAY">Tự luận</SelectItem>
                  <SelectItem value="CODING">Lập trình</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Nội dung câu hỏi *</Label>
              <Textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={3}
                required
              />
            </div>
            {type === 'MCQ' && (
              <>
                <div>
                  <Label>Các lựa chọn</Label>
                  {options.map((opt, idx) => (
                    <Input
                      key={idx}
                      value={opt}
                      onChange={(e) => {
                        const newOpts = [...options];
                        newOpts[idx] = e.target.value;
                        setOptions(newOpts);
                      }}
                      placeholder={`Lựa chọn ${String.fromCharCode(65 + idx)}`}
                      className="mt-1"
                    />
                  ))}
                </div>
                <div>
                  <Label>Đáp án đúng (A, B, C, D)</Label>
                  <Input
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value.toUpperCase())}
                    placeholder="Ví dụ: A"
                  />
                </div>
              </>
            )}
            <div>
              <Label>Giải thích (tùy chọn)</Label>
              <Textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={2}
              />
            </div>
            <div>
              <Label>Độ khó</Label>
              <Select value={difficulty} onValueChange={setDifficulty}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Dễ</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="hard">Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tags (cách nhau bằng dấu phẩy)</Label>
              <Input
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="react, hooks, useState"
              />
            </div>
            <div className="flex gap-2 pt-4">
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Đang thêm...' : 'Thêm câu hỏi'}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()}>
                Hủy
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
