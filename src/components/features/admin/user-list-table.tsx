import { Table, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { UserCog } from 'lucide-react';
import { User, UserRole, UserStatus } from '@/types/auth.api';
import { UpdateRoleDialog } from './update-role-dialog';

interface UserListTableProps {
  users: User[];
  isLoading: boolean;
  onUpdateRole: (userId: string, newRole: UserRole) => Promise<void>;
}

const RoleBadge = ({ role }: { role: UserRole }) => {
  const styles = {
    [UserRole.ADMIN]: 'bg-red-100 text-red-700 border-red-200',
    [UserRole.TEACHER]: 'bg-blue-100 text-blue-700 border-blue-200',
    [UserRole.STUDENT]: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  const labels = {
    [UserRole.ADMIN]: 'Quản trị viên',
    [UserRole.TEACHER]: 'Giảng viên',
    [UserRole.STUDENT]: 'Học viên',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[role]}`}>
      {labels[role]}
    </span>
  );
};

const StatusBadge = ({ status }: { status: UserStatus }) => {
  const isActive = status === UserStatus.ACTIVE;
  const isPending = status === UserStatus.PENDING_EMAIL_VERIFY;
  const isLocked = status === UserStatus.LOCKED;

  if (isActive) return <span className="text-xs font-medium text-green-600">● Hoạt động</span>;
  if (isPending) return <span className="text-xs font-medium text-yellow-600">● Chờ xác thực</span>;
  if (isLocked) return <span className="text-xs font-medium text-red-600">● Đã khóa</span>;
  return <span className="text-xs font-medium text-slate-400">● Không xác định</span>;
};

export const UserListTable = ({ users, isLoading, onUpdateRole }: UserListTableProps) => {
  if (isLoading) {
    return (
      <div className="p-8 text-center text-slate-500 bg-white rounded-lg border">
        <div className="animate-pulse">Đang tải dữ liệu người dùng...</div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 border rounded-md">
        Không tìm thấy người dùng nào.
      </div>
    );
  }

  if (!users || users.length === 0) {
    return (
      <div className="p-12 text-center bg-white rounded-lg border">
        <svg
          className="w-12 h-12 text-gray-300 mx-auto mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
        </svg>
        <p className="text-lg font-medium text-gray-600">Không tìm thấy người dùng nào</p>
        <p className="text-sm text-gray-400 mt-1">
          Vui lòng thử thay đổi bộ lọc hoặc từ khóa tìm kiếm.
        </p>
      </div>
    );
  }
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableCell className="font-semibold">Người dùng</TableCell>
          <TableCell className="font-semibold">Vai trò</TableCell>
          <TableCell className="font-semibold">Trạng thái</TableCell>
          <TableCell className="font-semibold">Ngày tham gia</TableCell>
          <TableCell className="font-semibold text-right">Thao tác</TableCell>
        </TableRow>
      </TableHeader>

      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell>
              <div className="flex flex-col">
                <span className="font-medium text-slate-900">{user.fullName}</span>
                <span className="text-xs text-slate-500">{user.email}</span>
              </div>
            </TableCell>

            <TableCell>
              <RoleBadge role={user.role as UserRole} />
            </TableCell>

            <TableCell>
              <StatusBadge status={user.status as UserStatus} />
            </TableCell>

            <TableCell className="text-slate-500">
              {new Date(user.createdAt).toLocaleDateString('vi-VN')}
            </TableCell>

            <TableCell className="text-right">
              <UpdateRoleDialog user={user} onUpdate={onUpdateRole}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <span className="sr-only">Cập nhật vai trò</span>
                  <UserCog className="h-4 w-4" />
                </Button>
              </UpdateRoleDialog>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
