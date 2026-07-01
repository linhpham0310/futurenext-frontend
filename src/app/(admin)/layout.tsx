import { AdminGuard } from '@/components/auth/admin-guard';
import { AdminHeader } from '@/components/layout/admin-header';
import { AdminSidebar } from '@/components/layout/admin-sidebar';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminGuard>
      <div className="flex min-h-screen bg-slate-50">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <AdminHeader />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </AdminGuard>
  );
}
