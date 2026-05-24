/**
 * @file Presentational component for the email verification OTP form using Shadcn UI InputOTP.
 */
'use client';

import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { VerifyEmailFormData } from '@/lib/schemas/auth.schema'; // Chỉ cần type này
import { Spinner } from '@/components/ui/spinner';

interface VerificationFormProps {
  form: UseFormReturn<VerifyEmailFormData>;
  onSubmit: (data: VerifyEmailFormData) => void;
  isLoading: boolean;
}

export function VerificationForm({ form, onSubmit, isLoading }: VerificationFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="otp"
          render={({ field }) => (
            <FormItem className="flex flex-col items-center justify-center space-y-3">
              {' '}
              {/* Căn giữa */}
              <FormLabel>Mã xác thực</FormLabel>
              <FormControl>
                {/* InputOTP với 6 ô, tự động focus ô tiếp theo */}
                <InputOTP maxLength={6} {...field} disabled={isLoading}>
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="text-lg h-12 w-10 md:h-14 md:w-12" />
                    <InputOTPSlot index={1} className="text-lg h-12 w-10 md:h-14 md:w-12" />
                    <InputOTPSlot index={2} className="text-lg h-12 w-10 md:h-14 md:w-12" />
                    <InputOTPSlot index={3} className="text-lg h-12 w-10 md:h-14 md:w-12" />
                    <InputOTPSlot index={4} className="text-lg h-12 w-10 md:h-14 md:w-12" />
                    <InputOTPSlot index={5} className="text-lg h-12 w-10 md:h-14 md:w-12" />
                  </InputOTPGroup>
                </InputOTP>
              </FormControl>
              <FormDescription>Nhập mã gồm 6 chữ số trong email của bạn.</FormDescription>
              <FormMessage /> {/* Hiển thị lỗi validation (vd: chưa nhập đủ 6 số) */}
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isLoading} aria-label="Xác thực Email">
          {isLoading && <Spinner className="mr-2 h-4 w-4" />}
          {isLoading ? 'Đang kiểm tra...' : 'Xác thực'}
        </Button>
      </form>
    </Form>
  );
}
