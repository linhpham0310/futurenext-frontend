/**
 * @file Presentational component for the user profile update form.
 * Renders form fields using Shadcn UI Form components.
 * [LLD Ref: 4.1 components/features/profile/ProfileForm.tsx]
 */
'use client';

import { useFormContext } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { UpdateProfileFormData } from '@/lib/schemas/user.schema';
import { Spinner } from '@/components/ui/spinner';
// (Optional) Import Avatar component nếu có
// import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ProfileFormProps {
  isLoading: boolean; // Chỉ trạng thái submit form
  onSubmit: (data: UpdateProfileFormData) => void; //  Thêm onSubmit vào props
}

/**
 * Renders the profile form fields (FullName, AvatarUrl).
 * Expects to be wrapped in Shadcn's <Form> provider.
 * @param isLoading - Disables inputs and shows spinner on the button when true.
 * @param onSubmit - Submit handler function from useProfile hook.
 */
export function ProfileForm({ isLoading, onSubmit }: ProfileFormProps) {
  const { control, handleSubmit, watch } = useFormContext<UpdateProfileFormData>();

  // (Optional) Watch avatarUrl để hiển thị preview
  const avatarUrlPreview = watch('avatarUrl');

  //  Lấy fullName để hiển thị avatar fallback
  //const _fullName = watch('fullName');

  //  Handle submit an toàn
  const onFormSubmit = handleSubmit((data) => {
    onSubmit(data);
  });

  return (
    <form onSubmit={onFormSubmit} className="space-y-6">
      {/* (Optional) Avatar Preview */}
      {avatarUrlPreview && (
        <div className="flex justify-center">
          <div className="relative h-24 w-24 rounded-full overflow-hidden bg-gray-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={avatarUrlPreview}
              alt="Avatar Preview"
              className="h-full w-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>
          {/* Nếu dùng Shadcn Avatar: */}
          {/* <Avatar className="h-24 w-24">
            <AvatarImage src={avatarUrlPreview || undefined} alt="Avatar Preview" />
            <AvatarFallback>{fullName?.charAt(0) || 'U'}</AvatarFallback>
          </Avatar> */}
        </div>
      )}

      {/* FullName Field */}
      <FormField
        control={control}
        name="fullName"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Họ và Tên</FormLabel>
            <FormControl>
              <Input placeholder="Họ và tên của bạn" {...field} disabled={isLoading} />
            </FormControl>
            <FormDescription className="text-xs">
              Tên sẽ hiển thị trên hồ sơ của bạn
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* AvatarUrl Field */}
      <FormField
        control={control}
        name="avatarUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>URL Ảnh đại diện</FormLabel>
            <FormControl>
              <Input
                placeholder="https://example.com/avatar.png"
                {...field}
                value={field.value ?? ''} // Đảm bảo input không nhận giá trị null
                disabled={isLoading}
              />
            </FormControl>
            <FormDescription className="text-xs">
              Dán URL ảnh công khai. Để trống hoặc xóa để gỡ ảnh.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      {/* updatedAt field is managed by the hook and not rendered */}

      {/* Submit Button */}
      <Button type="submit" className="w-full" disabled={isLoading} aria-label="Cập nhật hồ sơ">
        {isLoading && <Spinner className="mr-2 h-4 w-4" />}
        {isLoading ? 'Đang lưu...' : 'Lưu thay đổi'}
      </Button>
    </form>
  );
}
