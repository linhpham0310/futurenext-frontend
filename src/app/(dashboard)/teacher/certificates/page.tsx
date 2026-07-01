'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth/useAuth';
import { teacherApi } from '@/lib/api';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Download, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface Certificate {
  id: string;
  studentName: string;
  courseTitle: string;
  issuedAt: string;
  certificateUrl: string;
}

export default function TeacherCertificatesPage() {
  const { isTeacher, isLoading: authLoading } = useAuth();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [courses, setCourses] = useState<{ id: string; title: string }[]>([]);
  const [students, setStudents] = useState<{ id: string; fullName: string }[]>([]);
  const [issuing, setIssuing] = useState(false);

  const fetchCertificates = () => {
    teacherApi
      .getCertificates()
      .then((res) => setCertificates(res.data))
      .catch(() => toast.error('Không thể tải danh sách chứng chỉ'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (isTeacher) {
      fetchCertificates();
      teacherApi
        .getMyCourses()
        .then((res) => setCourses(res.data))
        .catch(() => {});
    }
  }, [isTeacher]);

  const handleCourseChange = async (courseId: string) => {
    setSelectedCourse(courseId);
    setSelectedStudent('');
    if (courseId) {
      try {
        const res = await teacherApi.getCourseStudents(courseId);
        setStudents(res.data);
      } catch {
        toast.error('Không thể tải danh sách học viên');
      }
    } else {
      setStudents([]);
    }
  };

  const handleIssueCertificate = async () => {
    if (!selectedCourse || !selectedStudent) {
      toast.error('Vui lòng chọn khóa học và học viên');
      return;
    }
    setIssuing(true);
    try {
      await teacherApi.issueCertificate(selectedCourse, selectedStudent);
      toast.success('Chứng chỉ đã được cấp');
      setDialogOpen(false);
      fetchCertificates();
    } catch {
      toast.error('Cấp chứng chỉ thất bại');
    } finally {
      setIssuing(false);
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
        <h1 className="text-2xl font-bold">Chứng chỉ đã cấp</h1>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-1" /> Cấp chứng chỉ mới
        </Button>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Danh sách chứng chỉ</CardTitle>
        </CardHeader>
        <CardContent>
          {certificates.length === 0 ? (
            <p className="text-muted-foreground">Chưa có chứng chỉ nào được cấp.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableCell>Học viên</TableCell>
                  <TableCell>Khóa học</TableCell>
                  <TableCell>Ngày cấp</TableCell>
                  <TableCell>Chứng chỉ</TableCell>
                </TableRow>
              </TableHeader>
              <TableBody>
                {certificates.map((cert) => (
                  <TableRow key={cert.id}>
                    <TableCell>{cert.studentName}</TableCell>
                    <TableCell>{cert.courseTitle}</TableCell>
                    <TableCell>{new Date(cert.issuedAt).toLocaleDateString('vi-VN')}</TableCell>
                    <TableCell>
                      <a href={cert.certificateUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm">
                          <Download className="h-4 w-4 mr-1" /> Tải
                        </Button>
                      </a>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cấp chứng chỉ</DialogTitle>
            <DialogDescription>Chọn khóa học và học viên để cấp chứng chỉ.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label>Khóa học</Label>
              <Select value={selectedCourse} onValueChange={handleCourseChange}>
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
            <div>
              <Label>Học viên</Label>
              <Select value={selectedStudent} onValueChange={setSelectedStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn học viên" />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.fullName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleIssueCertificate} disabled={issuing}>
              {issuing ? 'Đang cấp...' : 'Cấp chứng chỉ'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
