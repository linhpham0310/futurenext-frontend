'use client';

import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import React from 'react';

type SpinnerProps = React.SVGProps<SVGSVGElement>;

export function Spinner({ className, ...props }: SpinnerProps) {
  return <Loader2 className={cn('animate-spin', className)} {...props} />;
}
