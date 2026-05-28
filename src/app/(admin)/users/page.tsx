'use client';

import { UserListTable } from '@/components/features/admin/user-list-table';
import { Pagination } from '@/components/ui/pagination';
import { SelectFilter } from '@/components/ui/select-filter';
import { Input } from '@/components/ui/input';
import { useUserManagement } from '@/components/features/admin/use-user-management';
import { UserRole, UserStatus } from '@/types/auth.api';

export default function AdminUsersPage() {
  const { users, totalPages, isLoading, filters, setFilters, handleUpdateRole } =
    useUserManagement();

  //  Helper functions để xử lý change events
  const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters({ ...filters, role: value === '' ? '' : (value as UserRole), page: 1 });
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setFilters({ ...filters, status: value === '' ? '' : (value as UserStatus), page: 1 });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters({ ...filters, q: e.target.value, page: 1 });
  };

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-900">Quản lý người dùng</h1>

        <div className="w-full md:w-72">
          <Input
            placeholder="Tìm theo tên hoặc email..."
            value={filters.q}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-4">
        <SelectFilter
          label="Vai trò"
          options={[
            { label: 'Tất cả vai trò', value: '' },
            { label: 'Admin', value: UserRole.ADMIN },
            { label: 'Teacher', value: UserRole.TEACHER },
            { label: 'Student', value: UserRole.STUDENT },
          ]}
          value={filters.role}
          onChange={handleRoleChange} //  Không cần as any
        />
        <SelectFilter
          label="Trạng thái"
          options={[
            { label: 'Tất cả', value: '' },
            { label: 'Đang hoạt động', value: UserStatus.ACTIVE },
            { label: 'Đã khóa', value: UserStatus.LOCKED },
            { label: 'Chờ xác thực', value: UserStatus.PENDING_EMAIL_VERIFY },
          ]}
          value={filters.status}
          onChange={handleStatusChange} //  Không cần as any
        />
      </div>

      <div className="bg-white rounded-lg shadow-sm border">
        <UserListTable users={users} isLoading={isLoading} onUpdateRole={handleUpdateRole} />

        <Pagination
          currentPage={filters.page}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}
