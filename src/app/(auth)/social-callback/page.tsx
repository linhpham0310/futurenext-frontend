// src/app/auth/social-callback/page.tsx
'use client';

import { useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSocialLogin } from '@/hooks/auth/useSocialLogin';
import { Spinner } from '@/components/ui/spinner';

function SocialCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { handleCallback } = useSocialLogin();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const error = searchParams.get('error');

    if (error) {
      router.push('/sign-in?error=social_login_failed');
      return;
    }

    if (accessToken) {
      handleCallback(accessToken);
    } else {
      router.push('/sign-in?error=no_token');
    }
  }, [searchParams, router, handleCallback]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Spinner className="h-8 w-8 mx-auto" />
        <p className="mt-4 text-gray-600">Đang xác thực...</p>
      </div>
    </div>
  );
}

export default function SocialCallbackPage() {
  return (
    <Suspense
      fallback={<div className="flex items-center justify-center min-h-screen">Loading...</div>}
    >
      <SocialCallbackContent />
    </Suspense>
  );
}
