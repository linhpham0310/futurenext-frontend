'use client';

import { useEffect, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { apiClient } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Question {
  id: string;
  text: string;
  type: 'MCQ' | 'ESSAY';
  options?: string[];
}

interface ExamData {
  id: string;
  title: string;
  duration: number;
  questions: Question[];
  startTime: string;
  status: string;
}

export default function TakeExamPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const [exam, setExam] = useState<ExamData | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      apiClient
        .get(`/student/exams/${id}/take`)
        .then((res) => {
          if (res.data.status === 'COMPLETED') {
            toast.error('Bạn đã hoàn thành bài thi này');
            router.push(`/exams/${id}/result`);
            return;
          }
          setExam(res.data);
          const start = new Date(res.data.startTime).getTime();
          const now = Date.now();
          const elapsed = Math.floor((now - start) / 1000);
          const remaining = Math.max(0, res.data.duration * 60 - elapsed);
          setTimeLeft(remaining);
          const saved = localStorage.getItem(`exam_${id}_answers`);
          if (saved) setAnswers(JSON.parse(saved));
        })
        .catch(() => toast.error('Không thể tải đề thi'))
        .finally(() => setLoading(false));
    }
  }, [id, user, router]);

  // Timer

  // Lưu answers vào localStorage
  useEffect(() => {
    if (exam && Object.keys(answers).length > 0) {
      localStorage.setItem(`exam_${id}_answers`, JSON.stringify(answers));
    }
  }, [answers, exam, id]);

  // Cảnh báo rời trang
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (Object.keys(answers).length > 0 && timeLeft > 0 && exam?.status !== 'COMPLETED') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [answers, timeLeft, exam]);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const answersRef = useRef(answers);
  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  const handleSubmit = async (auto = false) => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const currentAnswers = answersRef.current;
      await apiClient.post(`/student/exams/${id}/submit`, { answers: currentAnswers });
      localStorage.removeItem(`exam_${id}_answers`);
      toast.success(auto ? 'Hết giờ! Bài đã được nộp.' : 'Nộp bài thành công');
      router.push(`/exams/${id}/result`);
    } catch {
      toast.error('Nộp bài thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    if (!exam || timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [exam]);

  if (authLoading || loading)
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  if (!exam) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center border-b pb-4">
        <h1 className="text-2xl font-bold">{exam.title}</h1>
        <div className="text-xl font-mono bg-gray-100 px-4 py-2 rounded">
          ⏱ {formatTime(timeLeft)}
        </div>
      </div>

      <div className="space-y-6">
        {exam.questions.map((q, idx) => (
          <div key={q.id} className="border rounded-lg p-4">
            <p className="font-medium mb-3">
              {idx + 1}. {q.text}
            </p>
            {q.type === 'MCQ' && q.options && (
              <RadioGroup
                value={answers[q.id] || ''}
                onValueChange={(val) => handleAnswerChange(q.id, val)}
              >
                {q.options.map((opt, optIdx) => (
                  <div key={optIdx} className="flex items-center space-x-2">
                    <RadioGroupItem
                      value={String.fromCharCode(65 + optIdx)}
                      id={`q${idx}_opt${optIdx}`}
                    />
                    <label htmlFor={`q${idx}_opt${optIdx}`} className="text-sm">
                      {String.fromCharCode(65 + optIdx)}. {opt}
                    </label>
                  </div>
                ))}
              </RadioGroup>
            )}
            {q.type === 'ESSAY' && (
              <Textarea
                value={answers[q.id] || ''}
                onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                rows={4}
                placeholder="Nhập câu trả lời của bạn..."
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex justify-end">
        <Button onClick={() => handleSubmit(false)} disabled={submitting}>
          {submitting ? 'Đang nộp...' : 'Nộp bài'}
        </Button>
      </div>
    </div>
  );
}
