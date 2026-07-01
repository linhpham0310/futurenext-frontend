// components/ui/rate-limit-alert.tsx
'use client';

import { AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RateLimitAlertProps {
  message?: string;
  lockedUntil?: string;
}

export function RateLimitAlert({ message, lockedUntil }: RateLimitAlertProps) {
  if (!message && !lockedUntil) return null;

  const isLocked = !!lockedUntil;
  const lockTime = lockedUntil ? new Date(lockedUntil).toLocaleTimeString('vi-VN') : '';

  return (
    <Alert
      variant={isLocked ? 'destructive' : 'default'}
      className="border-yellow-500 bg-yellow-50"
    >
      <AlertCircle className="h-4 w-4 text-yellow-600" />
      <AlertTitle>{isLocked ? 'Tài khoản bị khóa tạm thời' : 'Quá nhiều yêu cầu'}</AlertTitle>
      <AlertDescription>
        {message ||
          (isLocked
            ? `Tài khoản của bạn đã bị khóa do quá nhiều lần đăng nhập sai. Vui lòng thử lại sau ${lockTime}.`
            : 'Bạn đã thực hiện quá nhiều yêu cầu. Vui lòng thử lại sau vài phút.')}
        {isLocked && (
          <div className="flex items-center gap-2 mt-2">
            <Clock className="h-4 w-4" />
            <span>Khóa đến: {lockTime}</span>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
