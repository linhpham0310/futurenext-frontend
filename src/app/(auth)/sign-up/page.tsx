/**
 * @file Container page component for user registration.
 */
'use client';

import { useRegistration } from '@/hooks/auth/useRegistration';
import { RegisterForm } from '@/components/features/auth/RegisterForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';

export default function RegisterPage() {
  const { form, onSubmit, isLoading, apiError, isSuccess } = useRegistration();

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center space-y-2 text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-2 group">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
              <GraduationCap className="w-6 h-6 text-primary-foreground" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">
              FutureNext
            </span>
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Tạo tài khoản mới</h1>
          <p className="text-sm text-muted-foreground">
            Bắt đầu hành trình học tập bằng cách điền thông tin bên dưới
          </p>
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="pt-6 grid gap-4">
            {apiError && (
              <Alert variant="destructive" className="border-destructive/50 text-destructive">
                <AlertTitle>Đăng ký thất bại</AlertTitle>
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}

            {isSuccess && (
              <Alert className="border-green-500/50 text-green-600 bg-green-50/50 dark:bg-green-500/10 dark:text-green-400">
                <AlertTitle>Thành công</AlertTitle>
                <AlertDescription>
                  Vui lòng kiểm tra email để xác minh tài khoản của bạn.
                </AlertDescription>
              </Alert>
            )}

            <RegisterForm form={form} onSubmit={onSubmit} isLoading={isLoading} />

            <div className="relative my-2">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground font-medium">
                  Hoặc
                </span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" disabled className="w-full bg-transparent hover:bg-muted/50">
                Google
              </Button>
              <Button variant="outline" disabled className="w-full bg-transparent hover:bg-muted/50">
                Apple
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground">
          Đã có tài khoản?{' '}
          <Link
            href="/sign-in"
            className="font-semibold text-foreground hover:text-primary hover:underline underline-offset-4 transition-colors"
          >
            Đăng nhập
          </Link>
        </p>
      </div>
    </div>
  );
}
