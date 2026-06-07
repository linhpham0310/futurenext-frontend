// src/app/(main)/profile/page.tsx
'use client';

import { ProfileForm } from '@/components/features/profile/ProfileForm';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { Spinner } from '@/components/ui/spinner';
import { useProfile } from '@/hooks/auth/useProfile';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function StudentProfilePage() {
  const {
    form,
    onSubmit,
    profileData,
    isLoading,
    fetchError,
    isUpdating,
    updateError,
    updateSuccess,
  } = useProfile();

  useEffect(() => {
    if (updateSuccess) toast.success('Thành công', { description: 'Hồ sơ đã được cập nhật' });
    if (updateError) toast.error('Lỗi cập nhật', { description: updateError });
  }, [updateSuccess, updateError]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner className="h-8 w-8 text-blue-600" />
      </div>
    );
  }

  if (fetchError) {
    return (
      <Alert variant="destructive">
        <AlertDescription>{fetchError}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="border-blue-100 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold text-slate-900">Hồ sơ cá nhân</CardTitle>
          <CardDescription>
            Quản lý thông tin của bạn. Email (<b>{profileData?.email}</b>) không thể thay đổi.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <ProfileForm isLoading={isUpdating} onSubmit={onSubmit} />
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
