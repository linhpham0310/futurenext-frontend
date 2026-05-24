/**
 * @file Presentational component for the user registration form.
 * Uses Shadcn UI's Form components for integration with react-hook-form.
 */
'use client';

import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label'; // Import Label
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RegisterFormData } from '@/lib/schemas/auth.schema';
import Link from 'next/link';
import { Spinner } from '@/components/ui/spinner'; // Import Spinner
import { cn } from '@/lib/utils'; // thêm import

interface RegisterFormProps {
  form: UseFormReturn<RegisterFormData>;
  onSubmit: (data: RegisterFormData) => void;
  isLoading: boolean;
}

export function RegisterForm({ form, onSubmit, isLoading }: RegisterFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {' '}
        {/* Use internal onSubmit from context */}
        {/* Full Name */}
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Họ và Tên</FormLabel>
              <FormControl>
                <Input placeholder="Ví dụ: Trần Văn Hoàng" {...field} disabled={isLoading} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="hoang.tv@email.com"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Mật khẩu</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="********"
                  autoComplete="new-password"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormDescription className="text-xs">
                Ít nhất 8 ký tự, bao gồm chữ cái và số.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Confirm Password */}
        <FormField
          control={form.control}
          name="confirmPassword" // Make sure name matches schema
          render={({ field }) => (
            <FormItem>
              <FormLabel>Xác nhận Mật khẩu</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="********"
                  autoComplete="new-password"
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage /> {/* Lỗi khớp mật khẩu sẽ hiển thị ở đây */}
            </FormItem>
          )}
        />
        {/*Thêm FormField sau confirmPassword: */}
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bạn tham gia với vai trò?</FormLabel>
              <div className="grid grid-cols-2 gap-3 pt-1">
                {[
                  { value: 'student', label: 'Học viên', desc: 'Tôi muốn học' },
                  { value: 'teacher', label: 'Giảng viên', desc: 'Tôi muốn dạy' },
                ].map((option) => (
                  <div
                    key={option.value}
                    onClick={() => !isLoading && field.onChange(option.value)}
                    className={cn(
                      'cursor-pointer rounded-lg border p-4 transition-all select-none',
                      field.value === option.value
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/40'
                    )}
                  >
                    <p className="text-sm font-medium">{option.label}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{option.desc}</p>
                  </div>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Consent Checkbox */}
        <FormField
          control={form.control}
          name="consentAccepted"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-2">
              <FormControl>
                <Checkbox
                  checked={!!field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                  id="consent-checkbox-register" // Unique ID
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <Label
                  htmlFor="consent-checkbox-register"
                  className="text-sm font-normal text-muted-foreground cursor-pointer"
                >
                  {' '}
                  {/* Allow clicking label */}
                  Tôi đã đọc và đồng ý với{' '}
                  <Link href="/terms" target="_blank" className="underline hover:text-primary">
                    Điều khoản Dịch vụ
                  </Link>{' '}
                  và{' '}
                  <Link href="/privacy" target="_blank" className="underline hover:text-primary">
                    Chính sách Bảo mật
                  </Link>
                  .
                </Label>
                <FormMessage className="text-xs" /> {/* Lỗi chưa tick */}
              </div>
            </FormItem>
          )}
        />
        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading} aria-label="Tạo tài khoản">
          {isLoading && <Spinner className="mr-2 h-4 w-4" />} {/* Show spinner when loading */}
          {isLoading ? 'Đang xử lý...' : 'Tạo tài khoản'}
        </Button>
      </form>
    </Form>
  );
}
