'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import {
  Clock,
  Users,
  Star,
  Heart,
  Share2,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Calendar,
  Globe,
  MessageSquare,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { courseApi, studentApi } from '@/lib/api';
import { toast } from 'sonner';
import { BackButton } from '@/components/ui/back-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

interface Instructor {
  id: string;
  fullName: string;
  email: string;
  bio?: string;
  avatarUrl?: string;
  title?: string;
  rating?: number;
  students?: number;
  courses?: number;
}

interface Lesson {
  id: string;
  title: string;
  type: string;
  duration?: number;
  orderIndex: number;
}

interface Section {
  id: string;
  title: string;
  orderIndex: number;
  lessons: Lesson[];
}

interface Review {
  id: string;
  userId: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { fullName: string; avatarUrl?: string };
}

interface Question {
  id: string;
  userId: string;
  question: string;
  answer?: string;
  answeredAt?: string;
  createdAt: string;
  user: { fullName: string };
}

interface CourseDetail {
  id: string;
  title: string;
  description: string;
  duration: string;
  students: number;
  rating: number;
  price: number;
  originalPrice?: number;
  outcomes: string[];
  requirements?: string[];
  language?: string;
  updatedAt?: string;
  instructor: Instructor | null;
  sections: Section[];
  reviews: Review[];
  questions: Question[];
  isEnrolled?: boolean;
  isFavorite?: boolean;
}

// Component hiển thị phân phối sao
const RatingDistribution = ({ reviews }: { reviews: Review[] }) => {
  const total = reviews.length;
  if (total === 0) return null;
  const counts = [0, 0, 0, 0, 0];
  reviews.forEach((r) => {
    if (r.rating >= 1 && r.rating <= 5) counts[r.rating - 1]++;
  });
  const percentages = counts.map((c) => (c / total) * 100);

  return (
    <div className="space-y-1">
      {[5, 4, 3, 2, 1].map((star) => (
        <div key={star} className="flex items-center gap-2 text-sm">
          <span className="w-12">{star} sao</span>
          <Progress value={percentages[star - 1]} className="h-2 flex-1" />
          <span className="w-12 text-right text-muted-foreground">{counts[star - 1]}</span>
        </div>
      ))}
    </div>
  );
};

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteLoading, setFavoriteLoading] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());

  // Review state
  const [rating, setRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [hasReviewed, setHasReviewed] = useState(false);

  // ==================== FETCH COURSE ====================
  useEffect(() => {
    if (!id) return;
    const fetchDetail = async () => {
      setLoading(true);
      try {
        // Lấy myReviews nếu có, nếu không thì fallback
        let myReviewsData = [];
        try {
          const myReviewsRes = await studentApi.getMyReviews();
          myReviewsData = myReviewsRes.data || [];
        } catch {
          myReviewsData = [];
        }

        const [courseRes, favRes] = await Promise.all([
          courseApi.getPublicCourseDetail(id),
          studentApi.getFavorites().catch(() => ({ data: [] })),
        ]);

        // Lấy dữ liệu linh hoạt
        let data = courseRes.data;
        if (data && data.data) {
          data = data.data;
        }

        console.log('📦 Course detail data:', data);

        const favs = favRes.data || [];
        const isFav = favs.some((f: any) => f.id === data.id);

        const reviewed = myReviewsData.some((r: any) => r.courseId === id);
        setHasReviewed(reviewed);

        const instructor = data.instructor || data.teacher || null;
        const outcomes = Array.isArray(data.outcomes) ? data.outcomes : [];
        const questions = data.questions || [];

        const courseData: CourseDetail = {
          id: data.id,
          title: data.title,
          description: data.description || '',
          duration: data.duration || 'Chưa xác định',
          students: data.students || data._count?.purchases || 0,
          rating: data.rating || 0,
          price: data.price || 0,
          originalPrice: data.originalPrice || data.price * 1.3 || 0,
          outcomes,
          requirements: data.requirements || [],
          language: data.language || 'vi',
          updatedAt: data.updatedAt || data.createdAt,
          instructor,
          sections: data.sections || [],
          reviews: data.reviews || [],
          questions,
          isEnrolled: data.isEnrolled || false,
        };
        setCourse(courseData);
        setIsFavorite(isFav);
      } catch (error) {
        console.error(error);
        toast.error('Không thể tải thông tin khóa học');
        setCourse(null);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [id]);

  // Toggle section expand
  const toggleSection = (sectionId: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sectionId)) newSet.delete(sectionId);
      else newSet.add(sectionId);
      return newSet;
    });
  };

  // ==================== HANDLERS ====================
  const handleEnroll = async () => {
    setEnrolling(true);
    try {
      await studentApi.enrollCourse(id);
      toast.success('Đăng ký thành công!');
      setCourse((prev) => (prev ? { ...prev, isEnrolled: true } : prev));
      router.push(`/lx/${id}`);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Đăng ký thất bại');
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

  const handleToggleFavorite = async () => {
    setFavoriteLoading(true);
    try {
      if (isFavorite) {
        await studentApi.removeFavorite(id);
        setIsFavorite(false);
        toast.success('Đã xóa khỏi yêu thích');
      } else {
        await studentApi.addFavorite(id);
        setIsFavorite(true);
        toast.success('Đã thêm vào yêu thích');
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Không thể cập nhật yêu thích');
    } finally {
      setFavoriteLoading(false);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: course?.title || 'Khóa học',
      text: course?.description || 'Khóa học hấp dẫn trên FutureNext.ai',
      url,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // user cancelled
      }
    } else {
      try {
        await navigator.clipboard.writeText(url);
        toast.success('Đã sao chép link khóa học');
      } catch {
        toast.error('Không thể sao chép link');
      }
    }
  };

  const goToReview = () => {
    router.push(`/courses/${id}/review`);
  };

  const goToAskQuestion = () => {
    router.push(`/courses/${id}/ask`);
  };

  // Submit review (inline)
  const handleSubmitReview = async () => {
    if (!rating) {
      toast.error('Vui lòng chọn số sao');
      return;
    }
    setSubmittingReview(true);
    try {
      await studentApi.createReview(id, { rating, comment: reviewComment });
      toast.success('Cảm ơn bạn đã đánh giá!');
      // Refresh reviews
      const res = await courseApi.getPublicCourseDetail(id);
      let newData = res.data;
      if (newData && newData.data) newData = newData.data;
      setCourse((prev) => ({ ...prev!, reviews: newData.reviews || [] }));
      setHasReviewed(true);
      setRating(0);
      setReviewComment('');
    } catch (error: any) {
      toast.error(error?.response?.data?.message || 'Gửi đánh giá thất bại');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading)
    return (
      <div className="flex justify-center p-8">
        <Spinner />
      </div>
    );
  if (!course) return <div className="p-8">Khóa học không tồn tại.</div>;

  const hasDiscount = course.originalPrice && course.originalPrice > course.price;
  const discountPercent = hasDiscount
    ? Math.round((1 - course.price / course.originalPrice!) * 100)
    : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* HEADER + ACTIONS */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BackButton />
          <h1 className="text-3xl font-bold">{course.title}</h1>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={goToReview} className="gap-1">
            <Star className="h-4 w-4" /> Đánh giá
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleToggleFavorite}
            disabled={favoriteLoading}
            className="h-9 w-9"
          >
            <Heart className={`h-5 w-5 ${isFavorite ? 'fill-red-500 text-red-500' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon" onClick={handleShare} className="h-9 w-9">
            <Share2 className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* TOP SECTION: instructor + rating + meta */}
      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-4">
          {course.instructor && (
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={course.instructor.avatarUrl} />
                <AvatarFallback>{course.instructor.fullName?.charAt(0) || 'U'}</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">{course.instructor.fullName}</p>
                {course.instructor.title && (
                  <p className="text-sm text-muted-foreground">{course.instructor.title}</p>
                )}
              </div>
              <div className="flex items-center gap-2 ml-4">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{course.rating.toFixed(1)}</span>
                <span className="text-sm text-muted-foreground">
                  ({course.reviews.length} đánh giá)
                </span>
              </div>
              <div className="flex items-center gap-1 text-sm text-muted-foreground">
                <Users className="h-4 w-4" />
                <span>{course.students.toLocaleString()} học viên</span>
              </div>
            </div>
          )}

          <p className="text-muted-foreground">{course.description}</p>

          <div className="flex flex-wrap gap-4 text-sm">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" /> {course.duration}
            </span>
            {course.updatedAt && (
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" /> Cập nhật:{' '}
                {new Date(course.updatedAt).toLocaleDateString('vi-VN', {
                  month: 'long',
                  year: 'numeric',
                })}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Globe className="h-4 w-4" /> {course.language === 'vi' ? 'Tiếng Việt' : 'Tiếng Anh'}
            </span>
          </div>
        </div>

        {/* PRICE CARD */}
        <Card className="h-fit">
          <CardContent className="p-6 space-y-4">
            <div className="space-y-1">
              {hasDiscount ? (
                <>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-3xl font-bold text-red-600">
                      {course.price.toLocaleString('vi-VN')}đ
                    </span>
                    <span className="text-sm line-through text-muted-foreground">
                      {course.originalPrice!.toLocaleString('vi-VN')}đ
                    </span>
                    <Badge variant="destructive" className="text-xs">
                      -{discountPercent}%
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Tiết kiệm {(course.originalPrice! - course.price).toLocaleString('vi-VN')}đ
                  </p>
                </>
              ) : (
                <div className="text-3xl font-bold">{course.price.toLocaleString('vi-VN')}đ</div>
              )}
            </div>

            {course.isEnrolled ? (
              <Button className="w-full" size="lg" onClick={() => router.push(`/lx/${course.id}`)}>
                Vào học
              </Button>
            ) : course.price === 0 ? (
              <Button className="w-full" size="lg" onClick={handleEnroll} disabled={enrolling}>
                {enrolling ? 'Đang xử lý...' : 'Đăng ký ngay'}
              </Button>
            ) : (
              <>
                <Button
                  className="w-full"
                  size="lg"
                  variant="outline"
                  onClick={handleAddToCart}
                  disabled={addingToCart}
                >
                  {addingToCart ? 'Đang thêm...' : 'Thêm vào giỏ hàng'}
                </Button>
                <Button className="w-full" size="lg" onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? 'Đang xử lý...' : 'Mua ngay'}
                </Button>
              </>
            )}

            <div className="text-xs text-muted-foreground space-y-1">
              <p className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                {course.duration} - Học với tốc độ riêng
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Chứng chỉ hoàn thành
              </p>
              <p className="flex items-center gap-2">
                <CheckCircle className="h-3 w-3 text-green-500" />
                Tài liệu học tập
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* TABS */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Tổng quan</TabsTrigger>
          <TabsTrigger value="curriculum">Nội dung khóa học</TabsTrigger>
          <TabsTrigger value="reviews">
            <Star className="h-4 w-4 mr-1" /> Đánh giá ({course.reviews.length})
          </TabsTrigger>
          <TabsTrigger value="qna">
            <MessageSquare className="h-4 w-4 mr-1" /> Hỏi đáp ({course.questions.length})
          </TabsTrigger>
          <TabsTrigger value="instructor">Giảng viên</TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB */}
        <TabsContent value="overview">
          <div className="space-y-6">
            {course.outcomes.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Bạn sẽ học được</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {course.outcomes.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>Mô tả khóa học</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap">{course.description}</p>
              </CardContent>
            </Card>

            {course.requirements && course.requirements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Yêu cầu</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="list-disc pl-5 space-y-1">
                    {course.requirements.map((req, idx) => (
                      <li key={idx}>{req}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* CURRICULUM TAB */}
        <TabsContent value="curriculum">
          <Card>
            <CardHeader>
              <CardTitle>Nội dung khóa học</CardTitle>
              <p className="text-sm text-muted-foreground">
                {course.sections.length} chương •{' '}
                {course.sections.reduce((acc, s) => acc + s.lessons.length, 0)} bài học
              </p>
            </CardHeader>
            <CardContent>
              {course.sections.length === 0 ? (
                <p className="text-muted-foreground">Chưa có nội dung.</p>
              ) : (
                <div className="space-y-2">
                  {course.sections.map((section) => {
                    const isExpanded = expandedSections.has(section.id);
                    return (
                      <div key={section.id} className="border rounded-lg overflow-hidden">
                        <button
                          className="w-full flex items-center justify-between p-4 hover:bg-muted/50 transition"
                          onClick={() => toggleSection(section.id)}
                        >
                          <div className="flex items-center gap-2">
                            {isExpanded ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                            <span className="font-medium">{section.title}</span>
                            <Badge variant="outline" className="ml-2">
                              {section.lessons.length} bài học
                            </Badge>
                          </div>
                          <span className="text-sm text-muted-foreground">
                            {section.lessons.reduce((sum, l) => sum + (l.duration || 0), 0)} phút
                          </span>
                        </button>
                        {isExpanded && (
                          <div className="border-t p-4 space-y-2">
                            {section.lessons.map((lesson) => (
                              <div
                                key={lesson.id}
                                className="flex items-center justify-between text-sm"
                              >
                                <span className="flex items-center gap-2">
                                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                                  {lesson.title}
                                </span>
                                <span className="text-muted-foreground">
                                  {lesson.duration ? `${lesson.duration} phút` : ''}
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* REVIEWS TAB */}
        <TabsContent value="reviews">
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Đánh giá tổng quan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <span className="text-5xl font-bold">{course.rating.toFixed(1)}</span>
                  <div className="flex justify-center mt-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`h-5 w-5 ${star <= Math.round(course.rating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">{course.reviews.length} đánh giá</p>
                </div>
                <RatingDistribution reviews={course.reviews} />
              </CardContent>
            </Card>

            <Card className="md:col-span-2">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Đánh giá chi tiết</CardTitle>
              </CardHeader>
              <CardContent>
                {course.reviews.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Chưa có đánh giá nào.</p>
                ) : (
                  <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                    {course.reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4 last:border-0">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {review.user.fullName?.charAt(0) || 'U'}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{review.user.fullName}</p>
                            <div className="flex items-center gap-1 mt-0.5">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`h-3 w-3 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                                />
                              ))}
                              <span className="text-xs text-muted-foreground ml-2">
                                {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm mt-2">{review.comment}</p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Q&A TAB */}
        <TabsContent value="qna">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Câu hỏi và trả lời</CardTitle>
              <Button variant="outline" size="sm" onClick={goToAskQuestion}>
                <MessageSquare className="h-4 w-4 mr-1" /> Đặt câu hỏi
              </Button>
            </CardHeader>
            <CardContent>
              {course.questions.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">Chưa có câu hỏi nào.</p>
              ) : (
                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2">
                  {course.questions.map((q) => (
                    <div key={q.id} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between items-start">
                        <p className="font-medium">{q.user.fullName}</p>
                        <span className="text-xs text-muted-foreground">
                          {new Date(q.createdAt).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <p className="text-sm mt-1">{q.question}</p>
                      {q.answer && (
                        <div className="mt-2 bg-blue-50 p-3 rounded-md">
                          <p className="text-sm font-medium text-blue-700">Trả lời:</p>
                          <p className="text-sm">{q.answer}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {q.answeredAt ? new Date(q.answeredAt).toLocaleString('vi-VN') : ''}
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

        {/* INSTRUCTOR TAB */}
        <TabsContent value="instructor">
          {course.instructor ? (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={course.instructor.avatarUrl} />
                    <AvatarFallback className="text-2xl">
                      {course.instructor.fullName?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h2 className="text-2xl font-bold">{course.instructor.fullName}</h2>
                    {course.instructor.title && (
                      <p className="text-muted-foreground">{course.instructor.title}</p>
                    )}
                    <div className="flex flex-wrap gap-4 mt-2 text-sm">
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                        {course.instructor.rating?.toFixed(1) || '4.8'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {course.instructor.students?.toLocaleString() || '0'} học viên
                      </span>
                      <span className="flex items-center gap-1">
                        <BookOpen className="h-4 w-4" />
                        {course.instructor.courses || 0} khóa học
                      </span>
                    </div>
                    {course.instructor.bio && (
                      <div className="mt-3">
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                          {course.instructor.bio}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center text-muted-foreground">
                Chưa có thông tin giảng viên.
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
