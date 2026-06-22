/**
 * @file Container page component for user login.
 */
'use client';

import { LoginForm } from '@/components/features/auth/LoginForm'; // Import login form component
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
// import { Icons } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';
import { useLogin } from '@/hooks/auth/useLogin';
import { useSocialLogin } from '@/hooks/auth/useSocialLogin';

export default function LoginPage() {
  const { form, onSubmit, isLoading, apiError } = useLogin();
  const { loginWith } = useSocialLogin();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-white to-[#F5F3FF] flex">
      {/* Left side - Form */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
        <div className="w-full max-w-md">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 justify-center mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2563EB] to-[#7C3AED] rounded-xl flex items-center justify-center">
              <GraduationCap className="w-7 h-7 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
              FutureNext.ai
            </span>
          </Link>
          <Card className="w-full max-w-[400px]">
            <CardHeader className="text-center space-y-2">
              {/* <Icons.logo className="mx-auto h-8 w-auto mb-2" /> */}
              <CardTitle className="text-2xl font-semibold tracking-tight">Đăng nhập</CardTitle>
              <CardDescription>Nhập email và mật khẩu của bạn</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {/* Display general API errors */}
              {apiError && (
                <Alert variant="destructive">
                  {/* <Icons.alertTriangle className="h-4 w-4" /> */}
                  <AlertTitle>Đăng nhập thất bại</AlertTitle>
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}

              {/* Render Login Form */}
              <LoginForm form={form} onSubmit={onSubmit} isLoading={isLoading} />

              {/* Divider and Social Logins Placeholder */}
              <>
                <div className="relative my-2">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                      Hoặc tiếp tục với
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button variant="outline" disabled>
                    {/* <Icons.google className="mr-2 h-4 w-4" /> */} Google
                  </Button>
                  <Button variant="outline" disabled>
                    {/* <Icons.apple className="mr-2 h-4 w-4" /> */} Apple
                  </Button>
                  <Button variant="outline" disabled>
                    {/* <Icons.meta className="mr-2 h-4 w-4" /> */} Meta
                  </Button>
                </div>
              </>

              {/* Link to Register */}
              <p className="mt-4 px-8 text-center text-sm text-muted-foreground">
                Chưa có tài khoản?{' '}
                <Link
                  href="/sign-up"
                  className="underline underline-offset-4 hover:text-primary font-medium"
                >
                  Đăng ký
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right side - Image & Info */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#2563EB] to-[#7C3AED] items-center justify-center p-12">
        <div className="max-w-md text-white">
          <h2 className="text-white mb-6">Học tập thông minh với AI</h2>
          <p className="text-white/90 text-lg mb-8">
            Truy cập hàng trăm khóa học chất lượng cao, được cá nhân hóa bởi AI để phù hợp với mục
            tiêu của bạn.
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Lộ trình cá nhân hóa</h4>
                <p className="text-white/80 text-sm">
                  AI điều chỉnh nội dung phù hợp với trình độ của bạn
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Hỗ trợ 24/7</h4>
                <p className="text-white/80 text-sm">AI chatbot sẵn sàng giải đáp mọi thắc mắc</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h4 className="text-white font-semibold mb-1">Chứng chỉ công nhận</h4>
                <p className="text-white/80 text-sm">Được doanh nghiệp và tổ chức công nhận</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
