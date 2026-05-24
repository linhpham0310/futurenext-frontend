/**
 * @file Theme provider component using next-themes for light/dark/system mode management.
 */
'use client'; // Required for context and theme switching functionality

import * as React from 'react';
import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type { ThemeProviderProps } from 'next-themes/dist/types';

/**
 * Wraps the application with next-themes provider.
 * Configured to manage themes by adding/removing the 'dark' class on the HTML element,
 * defaulting to the system preference, and allowing system preference detection.
 */
export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class" // Apply theme ('light' or 'dark') as a class on the <html> tag
      defaultTheme="system" // Default to OS preference ('light' or 'dark')
      enableSystem // Enable the 'system' theme option
      disableTransitionOnChange // Prevent potential visual glitches during theme switch
      {...props} // Allow passing additional next-themes props if needed
    >
      {children}
    </NextThemesProvider>
  );
}
