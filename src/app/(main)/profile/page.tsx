'use client';

import { ProfileForm } from '@/components/features/profile/ProfileForm';
import { TeacherProfileForm } from '@/components/features/profile/teacher-profile-form';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';
import { useProfile } from '@/hooks/auth/useProfile';
import { TeacherProfile } from '@/types/auth.api';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function ProfilePage() {
  const {
    form,
    onSubmit,
    profileData,
    isLoading,
    fetchError,
    isUpdating,
    updateError,
    updateSuccess,
    refetchProfile,
  } = useProfile();

  useEffect(() => {
    if (updateSuccess) {
      toast.success('Thành công', {
        description: 'Hồ sơ của bạn đã được cập nhật',
      });
    }
  }, [updateSuccess]);

  useEffect(() => {
    if (updateError) {
      toast.error('Lỗi cập nhật', {
        description: updateError,
      });
    }
  }, [updateError]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Spinner className="h-10 w-10 text-primary" />
        <p className="ml-4 text-muted-foreground">Đang tải hồ sơ của bạn...</p>
      </div>
    );
  }

  if (fetchError) {
    return (
      <Alert variant="destructive">
        <AlertTitle>Lỗi tải hồ sơ</AlertTitle>
        <AlertDescription>{fetchError}</AlertDescription>
      </Alert>
    );
  }

  const isTeacher = profileData?.role === 'TEACHER';

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold">Hồ sơ cá nhân</CardTitle>
          <CardDescription>
            Quản lý thông tin cá nhân của bạn. Email (<b>{profileData?.email}</b>) không thể thay
            đổi.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          {updateError && (
            <Alert variant="destructive">
              <AlertTitle>Cập nhật thất bại</AlertTitle>
              <AlertDescription>{updateError}</AlertDescription>
            </Alert>
          )}

          {/* Form thông tin cơ bản */}
          <Form {...form}>
            <ProfileForm isLoading={isUpdating} onSubmit={onSubmit} />
          </Form>

          {/* Form đăng ký giảng viên - Chỉ hiển thị nếu chưa phải teacher */}
          {!isTeacher && (
            <TeacherProfileForm
              existingProfile={profileData?.teacherProfile as TeacherProfile | undefined}
              onSuccess={refetchProfile}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
