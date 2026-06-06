import Link from 'next/link';
import { GraduationCap } from 'lucide-react';

interface AppLogoProps {
  className?: string;
}

export function AppLogo({ className }: AppLogoProps) {
  return (
    <Link href="/" className={className ?? 'flex items-center gap-2 justify-center mb-8'}>
      <div className="w-12 h-12 bg-gradient-to-br from-[#2563EB] to-[#7C3AED] rounded-xl flex items-center justify-center">
        <GraduationCap className="w-7 h-7 text-white" />
      </div>
      <span className="text-2xl font-bold bg-gradient-to-r from-[#2563EB] to-[#7C3AED] bg-clip-text text-transparent">
        FutureNext.ai
      </span>
    </Link>
  );
}
