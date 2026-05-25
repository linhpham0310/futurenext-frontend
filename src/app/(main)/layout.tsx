/**
 * @file Layout cho các trang yêu cầu đăng nhập (vd: /dashboard, /profile).
 * Sẽ chứa Header, Sidebar và bảo vệ route.
 */
'use client'; // Cần client-side để check auth
import { useAuth } from '@/hooks/useAuth'; // Hook S1-FE-05
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Spinner } from '@/components/ui/spinner';
// Import Header (sẽ tạo ở S1-FE-08)
// import { SiteHeader } from "@/components/layout/SiteHeader";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  // (Nghiệp vụ) Bảo vệ Route: Kiểm tra xác thực
  useEffect(() => {
    // (Giả sử store đã rehydrate)
    // Nếu chưa rehydrate xong, isAuthenticated có thể là false
    // Cần 1 state loading từ store, tạm thời check đơn giản
    if (isAuthenticated === false) {
      // Chỉ check khi biết chắc là false
      console.log('[MainLayout] User not authenticated, redirecting to sign-in.');
      router.replace('/sign-in'); // Chuyển về trang đăng nhập
    }
  }, [isAuthenticated, router]);

  // Hiển thị loading spinner toàn trang nếu state auth chưa chắc chắn
  if (isAuthenticated === false) {
    // Hoặc dùng 1 state loading riêng từ store
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner className="h-10 w-10 text-primary" />
      </div>
    );
  }

  // Nếu đã xác thực, hiển thị layout chính
  return (
    <div className="flex min-h-screen flex-col">
      {/* <SiteHeader /> */} {/* Header sẽ chứa UserMenu (S1-FE-08) */}
      <div className="flex-grow container mx-auto p-4 md:p-8">{children}</div>
      {/* <SiteFooter /> */}
    </div>
  );
}
