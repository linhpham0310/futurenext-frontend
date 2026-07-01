'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { studentApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';

interface Result {
  score: number;
  totalQuestions: number;
  correctCount: number;
  wrongCount: number;
  details: {
    questionText: string;
    userAnswer: string;
    correctAnswer?: string;
    isCorrect?: boolean;
    explanation?: string;
  }[];
}

export default function ExamResultPage() {
  const { id } = useParams();
  const { user, isLoading: authLoading } = useAuth();
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && id) {
      studentApi
        .getExamResult(id as string)
        .then((res) => setResult(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [id, user]);

  if (authLoading || loading)
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  if (!result) return <div className="text-center py-12">Không tìm thấy kết quả.</div>;

  const percent = (result.score / result.totalQuestions) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-6">
      <div className="flex items-center justify-between">
        <BackButton />
        <h1 className="text-2xl font-bold">Kết quả bài thi</h1>
      </div>
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardContent className="p-6 text-center">
          <div className="text-5xl font-bold text-blue-600">
            {result.score} / {result.totalQuestions}
          </div>
          <div className="mt-2 text-lg">
            Đúng: {result.correctCount} | Sai: {result.wrongCount}
          </div>
          <div className="mt-4 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
            <div className="bg-green-500 h-full" style={{ width: `${percent}%` }} />
          </div>
        </CardContent>
      </Card>
      <div className="space-y-4">
        {result.details.map((q, idx) => (
          <Card key={idx}>
            <CardContent className="p-4">
              <div className="flex items-start gap-2">
                {q.isCorrect ? (
                  <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                ) : (
                  <XCircle className="h-5 w-5 text-red-500 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-medium">
                    {idx + 1}. {q.questionText}
                  </p>
                  <p className="text-sm mt-1">
                    Câu trả lời của bạn: {q.userAnswer || 'Chưa trả lời'}
                  </p>
                  {q.correctAnswer && (
                    <p className="text-sm text-green-600">Đáp án đúng: {q.correctAnswer}</p>
                  )}
                  {q.explanation && <p className="text-sm text-gray-500 mt-2">{q.explanation}</p>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
