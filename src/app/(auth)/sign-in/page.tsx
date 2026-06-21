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
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useSocialLogin } from '@/hooks/auth/useSocialLogin';

export default function LoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const { form, onSubmit, isLoading, apiError } = useLogin();
  const { loginWith } = useSocialLogin();

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

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
                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => loginWith('google')}
                    className="w-full"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </Button>

                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => loginWith('apple')}
                    className="w-full"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M12.15 3.5c.86-1.04 2.06-1.75 3.37-1.8.17 1.3-.42 2.59-1.22 3.5-.83.93-2.03 1.52-3.15 1.42-.16-1.27.46-2.64 1.0-3.12z"
                        fill="currentColor"
                      />
                      <path
                        d="M16.45 8.46c.78.91 1.28 2.02 1.27 3.18-.01 2.22-1.8 4.2-3.72 4.2-.96 0-1.72-.42-2.38-.42-.68 0-1.43.42-2.27.42-1.78 0-3.44-1.64-3.44-4.07 0-2.2 1.58-3.78 3.31-3.78.82 0 1.54.43 2.28.43.69 0 1.47-.43 2.33-.43.73 0 1.38.28 1.62.47z"
                        fill="currentColor"
                      />
                    </svg>
                    Apple
                  </Button>

                  <Button
                    variant="outline"
                    type="button"
                    onClick={() => loginWith('facebook')}
                    className="w-full"
                  >
                    <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                      <path
                        d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                        fill="#1877F2"
                      />
                    </svg>
                    Facebook
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
