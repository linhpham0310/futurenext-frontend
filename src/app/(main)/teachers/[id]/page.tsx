'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { teacherProfilesApi, courseApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { BackButton } from '@/components/ui/back-button';
import { Star, Users, BookOpen } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

interface InstructorDetail {
  id: string;
  fullName: string;
  avatarUrl?: string;
  bio?: string;
  rating: number;
  students: number;
  expertise?: string[];
  courses?: { id: string; title: string; price: number; thumbnailUrl?: string }[];
}

export default function InstructorDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [instructor, setInstructor] = useState<InstructorDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInstructor = async () => {
      try {
        const res = await teacherProfilesApi.getFeaturedTeachers(50);
        const teachers = res.data?.data || [];
        const found = teachers.find((t: any) => t.id === id);
        if (found) {
          // Lấy khóa học của giảng viên - dùng teacherId
          const courseRes = await courseApi.getPublicCourses({
            limit: 10,
            instructorId: id as string, // ← đổi thành teacherId
          });
          let courses = courseRes.data?.data || [];

          // Nếu API không lọc theo teacherId, filter client-side
          if (
            courses.length > 0 &&
            courses.some((c: any) => c.instructor?.id !== id && c.instructorId !== id)
          ) {
            courses = courses.filter((c: any) => c.instructor?.id === id || c.instructorId === id);
          }

          setInstructor({ ...found, courses });
        } else {
          toast.error('Không tìm thấy giảng viên');
          router.back();
        }
      } catch (error) {
        console.error('Lỗi tải thông tin giảng viên:', error);
        toast.error('Không thể tải thông tin giảng viên');
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchInstructor();
  }, [id, router]);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner />
      </div>
    );
  }

  if (!instructor) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Không tìm thấy giảng viên.</p>
        <Button variant="outline" className="mt-4" onClick={() => router.back()}>
          Quay lại
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Hồ sơ giảng viên</h1>
        <BackButton />
      </div>

      <Card>
        <CardContent className="p-6 flex flex-col items-center md:flex-row md:items-start gap-6">
          <Avatar className="w-24 h-24">
            <AvatarImage src={instructor.avatarUrl || undefined} />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-cyan-500 text-white text-2xl">
              {instructor.fullName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold">{instructor.fullName}</h2>
            <p className="text-muted-foreground">{instructor.bio || 'Chưa có giới thiệu'}</p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-2">
              <span className="flex items-center gap-1 text-yellow-500">
                <Star className="h-5 w-5 fill-current" />
                {instructor.rating}
              </span>
              <span className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-5 w-5" />
                {instructor.students} học viên
              </span>
            </div>
            {instructor.expertise && instructor.expertise.length > 0 && (
              <div className="flex flex-wrap justify-center md:justify-start gap-1 mt-3">
                {instructor.expertise.map((exp) => (
                  <span key={exp} className="bg-slate-100 text-xs px-3 py-1 rounded-full">
                    {exp}
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Khóa học của giảng viên */}
      <Card>
        <CardHeader>
          <CardTitle>Khóa học của {instructor.fullName}</CardTitle>
        </CardHeader>
        <CardContent>
          {!instructor.courses || instructor.courses.length === 0 ? (
            <p className="text-muted-foreground">Giảng viên chưa có khóa học nào.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {instructor.courses.map((course) => (
                <Card key={course.id} className="hover:shadow-md transition">
                  <CardContent className="p-3 flex gap-3 items-center">
                    <div className="w-16 h-16 rounded bg-muted flex items-center justify-center overflow-hidden">
                      {course.thumbnailUrl ? (
                        <img
                          src={course.thumbnailUrl}
                          alt={course.title}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <BookOpen className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm line-clamp-1">{course.title}</h4>
                      <p className="text-sm font-bold text-blue-600">
                        {course.price.toLocaleString('vi-VN')}đ
                      </p>
                      <Link href={`/courses/${course.id}`}>
                        <Button variant="outline" size="sm" className="mt-1">
                          Xem khóa học
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
