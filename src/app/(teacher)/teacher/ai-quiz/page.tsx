'use client';

import { useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { apiClient, teacherApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';

interface Question {
  question_text: string;
  options: string[];
  correct_answer: string;
  explanation: string;
}

export default function TeacherAIQuizPage() {
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [content, setContent] = useState('');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('medium');
  const [generating, setGenerating] = useState(false);
  const [questions, setQuestions] = useState<Question[]>([]);

  const handleGenerate = async () => {
    if (!content.trim()) {
      toast.error('Vui lòng nhập nội dung để tạo câu hỏi');
      return;
    }
    setGenerating(true);
    try {
      const response = await teacherApi.generateQuiz({
        topic: content,
        type: 'MCQ',
        duration: 60,
        numQuestions,
      });
      setQuestions(response.data.questions || []);
      toast.success(`Đã tạo ${response.data.questions?.length || 0} câu hỏi`);
    } catch (error) {
      toast.error('Tạo câu hỏi thất bại');
    } finally {
      setGenerating(false);
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
      <div>
        <h1 className="text-2xl font-bold">AI Tạo bài tập</h1>
        <p className="text-muted-foreground">
          Nhập nội dung bài giảng để AI tự động sinh câu hỏi trắc nghiệm
        </p>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          <Textarea
            placeholder="Nhập nội dung bài giảng, kiến thức cần kiểm tra..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm mb-1">Số lượng câu hỏi</label>
              <Input
                type="number"
                min={1}
                max={20}
                value={numQuestions}
                onChange={(e) => setNumQuestions(Number(e.target.value))}
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Độ khó</label>
              <select
                className="w-full p-2 border rounded"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
              >
                <option value="easy">Dễ</option>
                <option value="medium">Trung bình</option>
                <option value="hard">Khó</option>
              </select>
            </div>
          </div>
          <Button onClick={handleGenerate} disabled={generating} className="w-full">
            {generating ? <Spinner className="h-4 w-4 mr-2" /> : null}
            {generating ? 'Đang tạo...' : 'Tạo câu hỏi với AI'}
          </Button>
        </CardContent>
      </Card>

      {questions.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Kết quả ({questions.length} câu)</h2>
          {questions.map((q, idx) => (
            <Card key={idx}>
              <CardContent className="p-4">
                <p className="font-medium">
                  {idx + 1}. {q.question_text}
                </p>
                <ul className="mt-2 space-y-1 pl-4">
                  {q.options.map((opt, i) => (
                    <li
                      key={i}
                      className={`text-sm ${
                        opt === q.correct_answer ? 'text-green-600 font-medium' : ''
                      }`}
                    >
                      {String.fromCharCode(65 + i)}. {opt}
                    </li>
                  ))}
                </ul>
                <p className="text-sm text-muted-foreground mt-2">Giải thích: {q.explanation}</p>
              </CardContent>
            </Card>
          ))}
          <Button variant="outline" onClick={() => console.log('Lưu quiz:', questions)}>
            Lưu bộ câu hỏi
          </Button>
        </div>
      )}
    </div>
  );
}
