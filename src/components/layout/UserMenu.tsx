/**
 * @file UserMenu component (Dropdown) displayed in the SiteHeader.
 * Shows user info, provides links (Profile), and triggers Logout action.
 * (Task S1-FE-08)
 * [LLD Ref: 4.1 components/layout/UserMenu.tsx (tên tương tự), UC07.1]
 */
'use client'; // Required for hooks (useAuth) and Radix UI components

import { useAuth } from '@/hooks/auth/useAuth'; // Hook S1-FE-05 (đã cập nhật)
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'; // Component S1-FE-01
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'; // Component S1-FE-01
import { Spinner } from '@/components/ui/spinner'; // Component S1-FE-01
import { LifeBuoy, LogOut, User as UserIcon, Settings } from 'lucide-react'; // Icons
import Link from 'next/link';

/**
 * Renders the user avatar and a dropdown menu with profile and logout options.
 * Fetches user data and logout function from the useAuth hook.
 */
export function UserMenu() {
  // Lấy state (user) và actions (logout, isLoggingOut) từ hook useAuth
  const { user, logout, isLoggingOut } = useAuth(); // (S1-FE-05, S1-FE-08)

  // (Nghiệp vụ S1-FE-08) Hàm xử lý khi click mục "Đăng xuất" trong menu
  const handleLogoutClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent default link behavior if wrapped in <a>
    if (!isLoggingOut) {
      logout(); // Call the logout function from useAuth
    }
  };

  // Hiển thị trạng thái loading (hoặc skeleton) nếu user chưa được load (vd: đang rehydrate)
  if (!user) {
    return (
      <div className="flex items-center justify-center h-10 w-10 rounded-full bg-muted animate-pulse">
        {/* Optional: Add a simple spinner */}
        {/* <Spinner className="h-5 w-5 text-muted-foreground" /> */}
      </div>
    );
  }

  const getInitials = (fullName: string): string => {
    return fullName
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Render Dropdown Menu khi có thông tin user
  return (
    <DropdownMenu>
      {/* Trigger: Nút Avatar */}
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="relative h-10 w-10 rounded-full p-0 focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-0"
        >
          <Avatar className="h-10 w-10 border border-border/40">
            {' '}
            {/* Thêm viền nhẹ */}
            {/* Ảnh đại diện (từ S1-FE-07) */}
            <AvatarImage src={user.avatarUrl || undefined} alt={user.fullName || 'User Avatar'} />
            {/* Fallback: Chữ cái đầu (từ S1-FE-07) */}
            <AvatarFallback className="bg-muted text-muted-foreground font-semibold">
              {getInitials(user.fullName)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>

      {/* Nội dung Menu */}
      <DropdownMenuContent className="w-56" align="end" forceMount>
        {/* Thông tin User */}
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none truncate">{user.fullName}</p>
            <p className="text-xs leading-none text-muted-foreground truncate">{user.email}</p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        {/* Các mục Menu */}
        <DropdownMenuGroup>
          {/* (Nghiệp vụ S1-FE-07) Link đến trang Profile */}
          <Link href="/profile" passHref legacyBehavior>
            <DropdownMenuItem className="cursor-pointer">
              <UserIcon className="mr-2 h-4 w-4" />
              <span>Hồ sơ</span>
            </DropdownMenuItem>
          </Link>
          {/* (Optional) Link Cài đặt (nếu có) */}
          <DropdownMenuItem className="cursor-pointer" disabled>
            <Settings className="mr-2 h-4 w-4" />
            <span>Cài đặt</span>
          </DropdownMenuItem>
          {/* (Optional) Link Hỗ trợ */}
          <DropdownMenuItem className="cursor-pointer" disabled>
            <LifeBuoy className="mr-2 h-4 w-4" />
            <span>Hỗ trợ</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* (Nghiệp vụ S1-FE-08) Mục Đăng xuất */}
        <DropdownMenuItem
          onClick={handleLogoutClick} // Gọi hàm xử lý logout
          disabled={isLoggingOut} // Vô hiệu hóa khi đang xử lý
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer" // Style màu đỏ
        >
          {/* Hiển thị Spinner hoặc Icon tùy trạng thái */}
          {isLoggingOut ? (
            <Spinner className="mr-2 h-4 w-4 animate-spin" /> // Thêm animate-spin
          ) : (
            <LogOut className="mr-2 h-4 w-4" />
          )}
          <span>{isLoggingOut ? 'Đang đăng xuất...' : 'Đăng xuất'}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
