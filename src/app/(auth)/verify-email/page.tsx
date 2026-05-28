/**
 * @file Container page component for email verification using OTP.
 * Requires React Suspense due to useSearchParams hook.
 */
'use client';

import React from 'react'; // Import React for Suspense
import { useEmailVerification } from '@/hooks/auth/useEmailVerification'; // Import the hook
import { VerificationForm } from '@/components/features/auth/VerificationForm'; // Import the form
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';
// import { Icons } from '@/components/ui/icons'; // Import icons if used
import { Button } from '@/components/ui/button';
import { authApi } from '@/lib/api';
// Inner component to safely use the hook after Suspense resolves
function VerifyEmailContent() {
  const { form, onSubmit, isLoading, apiError, successMessage, emailFromUrl } =
    useEmailVerification();

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center space-y-1">
        {/* <Icons.mailCheck className="mx-auto h-10 w-10 text-primary mb-2" /> */}
        <CardTitle className="text-2xl font-semibold tracking-tight">Kiểm tra Hộp thư!</CardTitle>
        {emailFromUrl && !successMessage && (
          <CardDescription>
            Chúng tôi đã gửi mã xác thực gồm 6 chữ số đến{' '}
            <span className="font-medium break-all">{emailFromUrl}</span>
          </CardDescription>
        )}
        {successMessage && (
          <CardDescription>Tuyệt vời! Tài khoản của bạn đã được kích hoạt.</CardDescription>
        )}
        {!emailFromUrl && !successMessage && (
          <CardDescription className="text-destructive">
            URL không hợp lệ hoặc thiếu thông tin email.
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="grid gap-4">
        {/* Display API Error */}
        {apiError && !successMessage && (
          <Alert variant="destructive">
            {/* <Icons.alertTriangle className="h-4 w-4" /> */}
            <AlertTitle>Xác thực không thành công</AlertTitle>
            <AlertDescription>{apiError}</AlertDescription>
          </Alert>
        )}
        {/* Display Success Message */}
        {successMessage && (
          <Alert variant="success">
            {/* <Icons.checkCircle className="h-4 w-4" /> */}
            <AlertTitle>Thành công!</AlertTitle>
            <AlertDescription>{successMessage}</AlertDescription>
            <div className="mt-4">
              <Link href="/sign-in">
                <Button className="w-full">Đi đến Đăng nhập</Button>
              </Link>
            </div>
          </Alert>
        )}
        {/* Show Form only if email exists and not yet successful */}
        {!successMessage && emailFromUrl && (
          // Wrap the form with Shadcn's Form provider
          <VerificationForm form={form} onSubmit={onSubmit} isLoading={isLoading} />
        )}
        {/* Thay phần !successMessage && !emailFromUrl */}
        {!successMessage && !emailFromUrl && (
          <div className="space-y-3">
            <Alert variant="destructive">
              <AlertTitle>Không thể tiếp tục</AlertTitle>
              <AlertDescription>
                Vui lòng kiểm tra lại liên kết trong email hoặc thử đăng ký lại.
              </AlertDescription>
            </Alert>
            {/*  thêm nút quay lại */}
            <Link href="/sign-up">
              <Button variant="outline" className="w-full">
                Quay lại đăng ký
              </Button>
            </Link>
          </div>
        )}
        {/* Thay nút Gửi lại — kết nối API resend */}
        {!successMessage && emailFromUrl && (
          <p className="mt-2 text-center text-sm text-muted-foreground">
            Chưa nhận được mã?{' '}
            <button
              className="underline underline-offset-4 hover:text-primary disabled:opacity-50"
              disabled={isLoading}
              onClick={async () => {
                // gọi API resend
                try {
                  await authApi.resendOtp({ email: emailFromUrl });
                } catch (error) {
                  console.error('Resend OTP failed:', error);
                }
              }}
            >
              Gửi lại
            </button>
            {' | '}
            <Link href="/sign-in" className="underline underline-offset-4 hover:text-primary">
              Đăng nhập
            </Link>
          </p>
        )}
      </CardContent>
    </Card>
  );
}

// Main Page Component using Suspense boundary
export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <React.Suspense
        fallback={
          // Fallback UI while loading URL params
          <Card className="w-full max-w-md mx-auto">
            <CardContent className="flex flex-col items-center justify-center p-10 space-y-3">
              <Spinner className="h-8 w-8 text-primary" />
              <p className="text-muted-foreground">Đang tải dữ liệu...</p>
            </CardContent>
          </Card>
        }
      >
        <VerifyEmailContent />
      </React.Suspense>
    </div>
  );
}
