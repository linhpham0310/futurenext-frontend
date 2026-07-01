'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks/auth/useAuth';
import { teacherApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogFooter, DialogHeader } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface Exam {
  id: string;
  title: string;
  topic: string;
  type: string;
  duration: number;
  questionCount: number;
  isPublished: boolean;
  createdAt: string;
}

export default function TeacherExamsPage() {
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [publishDialog, setPublishDialog] = useState<{ open: boolean; examId: string | null }>({
    open: false,
    examId: null,
  });
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');

  const fetchExams = () => {
    teacherApi
      .getExams()
      .then((res) => setExams(res.data))
      .catch(() => toast.error('Không thể tải danh sách'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isTeacher) {
      fetchExams();
      teacherApi.getMyCourses().then((res) => setCourses(res.data));
    }
  }, [isTeacher]);

  const handlePublish = async () => {
    if (!publishDialog.examId || !selectedCourse) {
      toast.error('Vui lòng chọn khóa học');
      return;
    }
    try {
      await teacherApi.publishExam(publishDialog.examId, { courseId: selectedCourse });

      toast.success('Đã gán đề thi cho khóa học');
      setPublishDialog({ open: false, examId: null });
      setSelectedCourse('');
      fetchExams();
    } catch {
      toast.error('Lỗi khi gán đề');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Xóa đề thi này?')) return;
    try {
      await teacherApi.deleteExam(id);
      setExams(exams.filter((e) => e.id !== id));
      toast.success('Xóa thành công');
    } catch {
      toast.error('Xóa thất bại');
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
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Quiz của tôi</h1>
        <Link href="/teacher/exams/create">
          <Button>+ Tạo Quiz mới với AI</Button>
        </Link>
      </div>
      {exams.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Chưa có đề thi nào.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {exams.map((exam) => (
            <Card key={exam.id}>
              <CardContent className="p-4 space-y-2">
                <h3 className="font-bold text-lg">{exam.title}</h3>
                <p className="text-sm text-muted-foreground">Chủ đề: {exam.topic}</p>
                <p className="text-sm">
                  Loại:{' '}
                  {exam.type === 'MCQ'
                    ? 'Trắc nghiệm'
                    : exam.type === 'ESSAY'
                      ? 'Tự luận'
                      : 'Hỗn hợp'}{' '}
                  | {exam.duration} phút | {exam.questionCount} câu
                </p>
                <p className="text-xs">
                  Trạng thái: {exam.isPublished ? '✅ Đã gửi' : '📝 Bản nháp'}
                </p>
                <div className="flex gap-2 pt-2 flex-wrap">
                  <Link href={`/teacher/exams/${exam.id}/edit`}>
                    <Button variant="outline" size="sm">
                      Chỉnh sửa
                    </Button>
                  </Link>
                  <Link href={`/teacher/exams/${exam.id}/results`}>
                    <Button variant="outline" size="sm">
                      Xem kết quả
                    </Button>
                  </Link>
                  {!exam.isPublished && (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setPublishDialog({ open: true, examId: exam.id })}
                    >
                      Xuất bản
                    </Button>
                  )}
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(exam.id)}>
                    Xóa
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog
        open={publishDialog.open}
        onOpenChange={(open) => !open && setPublishDialog({ open: false, examId: null })}
      >
        <DialogContent>
          <DialogHeader>Chọn khóa học</DialogHeader>
          <select
            className="w-full p-2 border rounded"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">-- Chọn khóa học --</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPublishDialog({ open: false, examId: null })}
            >
              Hủy
            </Button>
            <Button onClick={handlePublish}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
