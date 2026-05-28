// src/app/(main)/profile/page.tsx
'use client';

import { Form } from '@/components/ui/form';
import { ProfileForm } from '@/components/features/profile/ProfileForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useProfile } from '@/hooks/auth/useProfile';

export default function ProfilePage() {
  //  Lấy onSubmit từ useProfile
  const { form, onSubmit, isLoading, isUpdating, updateError, updateSuccess } = useProfile();

  if (isLoading) {
    return <div className="flex justify-center p-8">Đang tải...</div>;
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Thông tin hồ sơ</CardTitle>
        </CardHeader>
        <CardContent>
          {/*  Truyền cả isLoading VÀ onSubmit */}
          <Form {...form}>
            <ProfileForm
              isLoading={isUpdating}
              onSubmit={onSubmit} // ← THÊM DÒNG NÀY
            />
          </Form>

          {/* Hiển thị thông báo thành công */}
          {updateSuccess && (
            <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-600">
              Cập nhật hồ sơ thành công!
            </div>
          )}

          {/* Hiển thị thông báo lỗi */}
          {updateError && (
            <div className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600">{updateError}</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
