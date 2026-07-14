'use client';

import { StudentHeader } from '@/components/layout/student-header';
import { useAuth } from '@/hooks/auth/useAuth';
import { Spinner } from '@/components/ui/spinner';
import { StudentSidebar } from '@/components/layout/student-sidebar';
import { usePathname } from 'next/navigation';

const dashboardRoutes = [
  '/dashboard',
  '/profile',
  '/my-courses',
  '/favorites',
  '/certificates',
  '/notifications',
  '/questions',
  '/orders',
  '/reviews',
  '/settings',
];

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isLoading } = useAuth();
  const pathname = usePathname();

  const isDashboardRoute = dashboardRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <StudentHeader />
      <div className="flex flex-1">
        {isDashboardRoute && <StudentSidebar />}
        <main className={`flex-1 ${isDashboardRoute ? 'p-6' : 'container mx-auto px-4 py-6 max-w-7xl'}`}>
          {children}
        </main>
      </div>
    </div>
  );
}
