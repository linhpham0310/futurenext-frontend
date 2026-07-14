'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Clock, Users, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { courseApi, studentApi } from '@/lib/api';
import { toast } from 'sonner';
import { BackButton } from '@/components/ui/back-button';

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  duration: string;
  students: number;
  rating: number;
  price: number;
  outcomes: string[];
  isEnrolled?: boolean;
}

interface ReviewItem {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

interface QuestionItem {
  id: string;
  studentName: string;
  question: string;
  answer?: string;
  answeredAt?: string;
  createdAt: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);

  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        const [courseRes, ownedRes] = await Promise.all([
          courseApi.getPublicCourseDetail(id),
          studentApi.getMyCourses().catch(() => ({ data: [] })),
        ]);
        const courseData = courseRes.data;
        const ownedIds = ownedRes.data.map((c: any) => c.id);
        setCourse({
          ...courseData,
          isEnrolled: ownedIds.includes(courseData.id),
        });
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const res = await studentApi.getCourseReviews(id);
      setReviews(res.data);
    } catch {
      toast.error('Không thể tải đánh giá');
    } finally {
      setReviewsLoading(false);
    }
  };

  const fetchQuestions = async () => {
    setQuestionsLoading(true);
    try {
      const res = await studentApi.getCourseQuestions(id);
      setQuestions(res.data);
    } catch {
      toast.error('Không thể tải câu hỏi');
    } finally {
      setQuestionsLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchReviews();
      fetchQuestions();
    }
  }, [id]);

  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await studentApi.enrollCourse(id);
      toast.success('Đăng ký thành công!');
      setCourse((prev) => (prev ? { ...prev, isEnrolled: true } : prev));
      router.push(`/lx/${id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại');
    } finally {
      setEnrolling(false);
    }
  };

  const handleAddToCart = async () => {
    setAddingToCart(true);
    try {
      await studentApi.addToCart(id);
      toast.success('Đã thêm vào giỏ hàng');
      router.push('/cart');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Thêm vào giỏ hàng thất bại');
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    );
  if (!course) return <div className="p-8">Khóa học không tồn tại.</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8">
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          <div className="flex items-center gap-2">
            <BackButton />
            <h1 className="text-3xl font-bold">{course.title}</h1>
          </div>
          <p className="text-muted-foreground">{course.description}</p>
          <div className="flex gap-4 flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {course.duration}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" /> {course.students} học viên
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500" /> {course.rating.toFixed(1)}
            </span>
          </div>
        </div>
        <Card className="h-fit">
          <CardContent className="p-6 space-y-4">
            <div className="text-3xl font-bold">{course.price.toLocaleString('vi-VN')}đ</div>
            {course.isEnrolled ? (
              <Button className="w-full" size="lg" onClick={() => router.push(`/lx/${course.id}`)}>
                Vào học
              </Button>
            ) : course.price === 0 ? (
              <Button className="w-full" size="lg" onClick={handleEnroll} disabled={enrolling}>
                {enrolling ? 'Đang xử lý...' : 'Đăng ký ngay'}
              </Button>
            ) : (
              <Button
                className="w-full"
                size="lg"
                variant="outline"
                onClick={handleAddToCart}
                disabled={addingToCart}
              >
                {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
              </Button>
            )}
            <p className="text-xs text-muted-foreground text-center">
              {course.price === 0 ? 'Miễn phí' : '30 ngày hoàn tiền'}
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="reviews">
            <Star className="h-4 w-4 mr-1" /> Đánh giá ({reviews.length})
          </TabsTrigger>
          <TabsTrigger value="qna">Đặt câu hỏi ({questions.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Bạn sẽ học được</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {course.outcomes.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Badge variant="secondary">✓</Badge> {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews">
          <Card>
            <CardHeader>
              <CardTitle>Đánh giá từ học viên</CardTitle>
            </CardHeader>
            <CardContent>
              {reviewsLoading ? (
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Chưa có đánh giá nào.</p>
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
                                className={`h-4 w-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground/60'}`}
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

        <TabsContent value="qna">
          <Card>
            <CardHeader>
              <CardTitle>Câu hỏi & Trả lời</CardTitle>
            </CardHeader>
            <CardContent>
              {questionsLoading ? (
                <div className="flex justify-center py-4">
                  <Spinner />
                </div>
              ) : questions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Chưa có câu hỏi nào.</p>
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
                      {q.answer && (
                        <div className="mt-2 bg-muted/50 p-3 rounded-md">
                          <p className="text-sm font-medium text-foreground">Trả lời:</p>
                          <p className="text-sm">{q.answer}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {q.answeredAt && new Date(q.answeredAt).toLocaleString('vi-VN')}
                          </p>
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
