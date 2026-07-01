'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth/useAuth';
import { teacherApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Star, MessageSquare, Reply } from 'lucide-react';

interface Review {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface Question {
  id: string;
  studentName: string;
  question: string;
  answer?: string;
  answeredAt?: string;
  createdAt: string;
}

export default function CourseFeedbackPage() {
  const { id } = useParams();
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answeringId, setAnsweringId] = useState<string | null>(null);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isTeacher && id) {
      Promise.all([
        teacherApi.getCourseReviews(id as string),
        teacherApi.getCourseQuestions(id as string),
      ])
        .then(([reviewsRes, questionsRes]) => {
          setReviews(reviewsRes.data || []);
          setQuestions(questionsRes.data || []);
        })
        .catch(() => toast.error('Không thể tải phản hồi'))
        .finally(() => setLoading(false));
    }
  }, [id, isTeacher]);

  const handleAnswer = async (questionId: string) => {
    if (!answerText.trim()) {
      toast.error('Vui lòng nhập câu trả lời');
      return;
    }
    setSubmitting(true);
    try {
      await teacherApi.answerQuestion(id as string, questionId, answerText);
      setQuestions((prev) =>
        prev.map((q) =>
          q.id === questionId
            ? { ...q, answer: answerText.trim(), answeredAt: new Date().toISOString() }
            : q
        )
      );
      setAnsweringId(null);
      setAnswerText('');
      toast.success('Đã trả lời câu hỏi');
    } catch {
      toast.error('Trả lời thất bại');
    } finally {
      setSubmitting(false);
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
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold">Phản hồi & Hỏi đáp</h1>

      <Tabs defaultValue="reviews">
        <TabsList>
          <TabsTrigger value="reviews">
            <Star className="h-4 w-4 mr-1" /> Đánh giá ({reviews.length})
          </TabsTrigger>
          <TabsTrigger value="questions">
            <MessageSquare className="h-4 w-4 mr-1" /> Câu hỏi ({questions.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Đánh giá từ học viên</CardTitle>
            </CardHeader>
            <CardContent>
              {reviews.length === 0 ? (
                <p className="text-muted-foreground">Chưa có đánh giá nào.</p>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="border-b pb-3 last:border-0">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{review.studentName}</p>
                          <div className="flex items-center gap-1 mt-1">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'fill-yellow-400 text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-sm mt-2">{review.comment}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <Card>
            <CardHeader>
              <CardTitle>Câu hỏi từ học viên</CardTitle>
            </CardHeader>
            <CardContent>
              {questions.length === 0 ? (
                <p className="text-muted-foreground">Chưa có câu hỏi nào.</p>
              ) : (
                <div className="space-y-4">
                  {questions.map((q) => (
                    <div key={q.id} className="border-b pb-3 last:border-0">
                      <div className="flex justify-between items-start">
                        <p className="font-medium">{q.studentName}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(q.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{q.question}</p>
                      {q.answer ? (
                        <div className="mt-2 bg-blue-50 p-3 rounded-md">
                          <p className="text-sm font-medium text-blue-700">Trả lời:</p>
                          <p className="text-sm">{q.answer}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {new Date(q.answeredAt!).toLocaleString('vi-VN')}
                          </p>
                        </div>
                      ) : (
                        <div className="mt-2">
                          {answeringId === q.id ? (
                            <div className="space-y-2">
                              <Textarea
                                value={answerText}
                                onChange={(e) => setAnswerText(e.target.value)}
                                placeholder="Nhập câu trả lời..."
                                rows={2}
                              />
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => handleAnswer(q.id)}
                                  disabled={submitting}
                                >
                                  {submitting ? 'Đang gửi...' : 'Gửi trả lời'}
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => setAnsweringId(null)}
                                >
                                  Hủy
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setAnsweringId(q.id)}
                            >
                              <Reply className="h-3 w-3 mr-1" /> Trả lời
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
