/**
 * @file SiteHeader component (Organism) - Task S1-FE-08.
 * Provides consistent branding, navigation placeholder, and user controls (theme, profile/logout).
 * Intended for use within the main application layout (e.g., MainLayout).
 * [LLD Ref: 4.1 components/layout/Header.tsx (tên tương tự)]
 */
'use client'; // Required because UserMenu and ThemeToggle are client components

import Link from 'next/link';
import { ThemeToggle } from '@/components/layout/theme-toggle'; // (S1-FE-01)
import { UserMenu } from '@/components/layout/UserMenu'; // (S1-FE-08)
import { cn } from '@/lib/utils';
// import { Icons } from "@/components/ui/icons"; // (Optional: for logo icon)

/**
 * Renders the main site header with logo, navigation placeholder, theme toggle, and user menu.
 */
export function SiteHeader() {
  return (
    // (UI) Sticky header with backdrop blur effect for modern look
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* (UI) Container to constrain width and center content */}
      <div className="container flex h-16 max-w-5xl items-center">
        {' '}
        {/* Use consistent max-width */}
        {/* Left section: Logo and Main Navigation */}
        <div className="mr-4 flex">
          {/* Logo Link */}
          <Link href="/dashboard" className="mr-6 flex items-center space-x-2">
            {/* (Optional) <Icons.logo className="h-6 w-6" /> */}
            {/* (UI) Tên thương hiệu */}
            <span className="font-bold sm:inline-block text-lg">FutureNext.ai</span>
          </Link>
          {/* (UI) Placeholder cho Navigation chính */}
          <nav className="hidden items-center space-x-6 text-sm font-medium md:flex">
            <Link
              href="/dashboard" // Link tới trang chính (sau login)
              className="text-foreground/80 transition-colors hover:text-foreground" // Slightly darker text
            >
              Bảng điều khiển
            </Link>
            <Link
              href="/courses" // Placeholder link
              className="text-foreground/60 transition-colors hover:text-foreground/80"
            >
              Khóa học
            </Link>
            {/* Add other main navigation links here */}
          </nav>
        </div>
        {/* (UI) Căn các nút điều khiển sang phải */}
        <div className="flex flex-1 items-center justify-end space-x-2">
          {/* (Nghiệp vụ S1-FE-01) Nút chuyển Theme */}
          <ThemeToggle />
          {/* (Nghiệp vụ S1-FE-08) Menu người dùng */}
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
