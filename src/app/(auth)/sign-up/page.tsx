/**
 * @file Container page component for user registration.
 */
'use client';

import { useRegistration } from '@/hooks/auth/useRegistration';
import { RegisterForm } from '@/components/features/auth/RegisterForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';

export default function RegisterPage() {
  const router = useRouter();

  const [role, setRole] = useState<'student' | 'teacher'>('student');
  const { isAuthenticated } = useAuthStore();

  const { form, onSubmit, isLoading, apiError, isSuccess } = useRegistration();

  if (isAuthenticated) {
    router.push('/dashboard');
    return null;
  }

  const handleSocialRegister = (provider: 'google' | 'apple' | 'facebook') => {
    authApi.registerWithSocial(provider, role);
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#EFF6FF] via-white to-[#F5F3FF] flex">
      {/* Left side - Image & Info */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-[#7C3AED] to-[#2563EB] items-center justify-center p-12">
        <div className="max-w-md text-white">
          <h2 className="text-white mb-6">Tham gia cộng đồng học tập</h2>
          <p className="text-white/90 text-lg mb-8">
            Hơn 10,000 học viên đã thay đổi sự nghiệp của họ thông qua các khóa học chất lượng cao
            trên nền tảng của chúng tôi.
          </p>
          <div className="grid grid-cols-2 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-bold text-white mb-1">500+</div>
              <div className="text-white/80 text-sm">Khóa học</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-bold text-white mb-1">200+</div>
              <div className="text-white/80 text-sm">Giảng viên</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-bold text-white mb-1">10K+</div>
              <div className="text-white/80 text-sm">Học viên</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
              <div className="text-3xl font-bold text-white mb-1">4.8/5</div>
              <div className="text-white/80 text-sm">Đánh giá</div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Form */}
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
          </Link>{' '}
          <Card className="w-full max-w-[420px]">
            <CardHeader className="text-center space-y-2">
              <CardTitle className="text-2xl font-semibold tracking-tight">Tạo tài khoản</CardTitle>
              <CardDescription>Điền thông tin bên dưới để đăng ký</CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4">
              {/* API error */}
              {apiError && (
                <Alert variant="destructive">
                  <AlertTitle>Đăng ký thất bại</AlertTitle>
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}

              {/* Success message */}
              {isSuccess && (
                <Alert>
                  <AlertTitle>Đăng ký thành công</AlertTitle>
                  <AlertDescription>
                    Vui lòng kiểm tra email để xác minh tài khoản.
                  </AlertDescription>
                </Alert>
              )}

              {/* Register Form */}
              <RegisterForm form={form} onSubmit={onSubmit} isLoading={isLoading} />

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
                <div className="social-buttons">
                  <button onClick={() => handleSocialRegister('google')} className="btn-google">
                    <img src="/google-icon.svg" alt="Google" width={20} height={20} />
                    Google
                  </button>
                  <Button variant="outline" disabled>
                    {' '}
                    {/* Use Button component */}
                    {/* <Icons.apple className="mr-2 h-4 w-4" /> */} Apple
                  </Button>

                  <Button variant="outline" disabled>
                    {/* <Icons.meta className="mr-2 h-4 w-4" /> */} Meta
                  </Button>
                </div>
              </>

              {/* Link to Login */}
              <p className="mt-4 px-8 text-center text-sm text-muted-foreground">
                Đã có tài khoản?{' '}
                <Link
                  href="/sign-in"
                  className="underline underline-offset-4 hover:text-primary font-medium"
                >
                  Đăng nhập
                </Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
