'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { teacherApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Download } from 'lucide-react';
import { BackButton } from '@/components/ui/back-button';

interface LessonProgressReport {
  lessonId: string;
  lessonTitle: string;
  totalStudents: number;
  completed: number;
  inProgress: number;
  notStarted: number;
  completionRate: number;
}

export default function AdvancedReportsPage() {
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [report, setReport] = useState<LessonProgressReport[]>([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (isTeacher) {
      teacherApi
        .getMyCourses()
        .then((res) => setCourses(res.data))
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }, [isTeacher]);

  const fetchReport = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    try {
      const res = await teacherApi.getLessonProgressReport(selectedCourse);
      setReport(res.data);
    } catch {
      toast.error('Không thể tải báo cáo');
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    if (!selectedCourse) return;
    setExporting(true);
    try {
      const response = await teacherApi.exportLessonProgressReport(selectedCourse);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `lesson_progress_${selectedCourse}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Xuất báo cáo thành công');
    } catch {
      toast.error('Xuất thất bại');
    } finally {
      setExporting(false);
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
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Báo cáo nâng cao</h1>
      </div>
      <div className="flex flex-wrap gap-4 items-end">
        <div className="w-64">
          <label className="block text-sm mb-1">Chọn khóa học</label>
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger>
              <SelectValue placeholder="Chọn khóa học" />
            </SelectTrigger>
            <SelectContent>
              {courses.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button onClick={fetchReport} disabled={!selectedCourse}>
          Xem báo cáo
        </Button>
        <Button variant="outline" onClick={exportReport} disabled={!selectedCourse || exporting}>
          <Download className="h-4 w-4 mr-1" /> Xuất Excel
        </Button>
      </div>

      {selectedCourse && report.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tiến độ từng bài học</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Bài học</TableCell>
                  <TableCell className="text-center">Hoàn thành</TableCell>
                  <TableCell className="text-center">Đang học</TableCell>
                  <TableCell className="text-center">Chưa bắt đầu</TableCell>
                  <TableCell className="text-center">Tỷ lệ hoàn thành</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {report.map((item) => (
                  <TableRow key={item.lessonId}>
                    <TableCell className="font-medium">{item.lessonTitle}</TableCell>
                    <TableCell className="text-center text-green-600">{item.completed}</TableCell>
                    <TableCell className="text-center text-yellow-600">{item.inProgress}</TableCell>
                    <TableCell className="text-center text-gray-400">{item.notStarted}</TableCell>
                    <TableCell className="text-center font-bold">{item.completionRate}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
