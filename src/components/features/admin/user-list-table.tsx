import { Table, TableHeader, TableRow, TableCell, TableBody } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { UserCog } from 'lucide-react';
import { User, UserRole, UserStatus } from '@/types/auth.api';

interface UserListTableProps {
  users: User[];
  isLoading: boolean;
  onUpdateRole: (userId: string, newRole: UserRole) => void;
}

const RoleBadge = ({ role }: { role: UserRole }) => {
  const styles = {
    [UserRole.ADMIN]: 'bg-red-100 text-red-700 border-red-200',
    [UserRole.TEACHER]: 'bg-blue-100 text-blue-700 border-blue-200',
    [UserRole.STUDENT]: 'bg-slate-100 text-slate-700 border-slate-200',
  };

  return (
    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${styles[role]}`}>
      {role}
    </span>
  );
};

const StatusBadge = ({ status }: { status: UserStatus }) => {
  const isActive = status === UserStatus.ACTIVE;

  return (
    <span className={`text-xs font-medium ${isActive ? 'text-green-600' : 'text-slate-400'}`}>
      ● {isActive ? 'Hoạt động' : 'Khóa'}
    </span>
  );
};

export const UserListTable = ({ users, isLoading, onUpdateRole }: UserListTableProps) => {
  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Đang tải dữ liệu người dùng...</div>;
  }

  if (users.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 border rounded-md">
        Không tìm thấy người dùng nào.
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
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onUpdateRole(user.id, UserRole.TEACHER)}
              >
                <UserCog className="h-4 w-4" />
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
