'use client';

import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface BackButtonProps {
  label?: string;
  className?: string;
  fallbackHref?: string;
}

export function BackButton({
  label = 'Quay lại',
  className = '',
  fallbackHref = '/',
}: BackButtonProps) {
  const router = useRouter();

  const handleBack = () => {
    if (window.history.length > 1) {
      router.back();
    } else {
      router.push(fallbackHref);
    }
  };

  return (
    <Button variant="outline" size="sm" className={className} onClick={handleBack}>
      <ArrowLeft className="h-4 w-4 mr-1" />
      {label}
    </Button>
  );
}
