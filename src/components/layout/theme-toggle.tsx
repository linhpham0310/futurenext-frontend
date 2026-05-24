/**
 * @file Button component to toggle between light and dark themes using next-themes.
 */
'use client'; // Requires client-side hook 'useTheme'

import * as React from 'react';
import { Moon, Sun } from 'lucide-react'; // Icons for dark and light mode
import { useTheme } from 'next-themes'; // Hook from next-themes

import { Button } from '@/components/ui/button'; // Use Shadcn Button

/**
 * Renders a button that toggles the application's theme between light and dark.
 * Displays a Sun icon in light mode and a Moon icon in dark mode.
 */
export function ThemeToggle() {
  const { setTheme, theme } = useTheme(); // Get current theme and setter function

  return (
    <Button
      variant="ghost" // Use ghost variant for minimal styling
      size="icon" // Render as a square icon button
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} // Toggle theme logic
      aria-label={theme === 'light' ? 'Chuyển sang chế độ tối' : 'Chuyển sang chế độ sáng'} // Accessibility label
    >
      {/* Sun icon: Visible in light mode, rotates out in dark mode */}
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      {/* Moon icon: Hidden in light mode, rotates in in dark mode */}
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Chuyển đổi theme</span> {/* Screen reader only text */}
    </Button>
  );
}
