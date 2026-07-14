/**
 * @file Container page component for user login.
 */
'use client';

import { LoginForm } from '@/components/features/auth/LoginForm';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { GraduationCap } from 'lucide-react';
import { useLogin } from '@/hooks/auth/useLogin';

export default function LoginPage() {
  const { form, onSubmit, isLoading, apiError } = useLogin();

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
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">Chào mừng trở lại</h1>
          <p className="text-sm text-muted-foreground">
            Đăng nhập vào tài khoản của bạn để tiếp tục học tập
          </p>
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="pt-6 grid gap-4">
            {apiError && (
              <Alert variant="destructive" className="border-destructive/50 text-destructive">
                <AlertTitle>Đăng nhập thất bại</AlertTitle>
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}

            <LoginForm form={form} onSubmit={onSubmit} isLoading={isLoading} />

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
          Chưa có tài khoản?{' '}
          <Link
            href="/sign-up"
            className="font-semibold text-foreground hover:text-primary hover:underline underline-offset-4 transition-colors"
          >
            Đăng ký ngay
          </Link>
        </p>
      </div>
    </div>
  );
}
