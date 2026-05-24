/**
 * @file Presentational component for the user login form.
 */
'use client';

import { UseFormReturn } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { LoginFormData } from '@/lib/schemas/auth.schema';
import { Spinner } from '@/components/ui/spinner';
import Link from 'next/link';

interface LoginFormProps {
  form: UseFormReturn<LoginFormData>;
  onSubmit: (data: LoginFormData) => void;
  isLoading: boolean;
}

export function LoginForm({ form, onSubmit, isLoading }: LoginFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Email */}
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="email@example.com"
                  autoComplete="email" // Improve UX
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password */}
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                {' '}
                {/* Align label and forgot password link */}
                <FormLabel>Mật khẩu</FormLabel>
                <Link
                  href="/forgot-password" // Link to forgot password page
                  className="text-sm font-medium text-primary hover:underline underline-offset-4"
                  tabIndex={-1} // Optional: remove from tab order if needed
                >
                  Quên mật khẩu?
                </Link>
              </div>
              <FormControl>
                <Input
                  type="password"
                  placeholder="********"
                  autoComplete="current-password" // Improve UX
                  {...field}
                  disabled={isLoading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Submit Button */}
        <Button type="submit" className="w-full" disabled={isLoading} aria-label="Đăng nhập">
          {isLoading && <Spinner className="mr-2 h-4 w-4" />}
          {isLoading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </Button>
      </form>
    </Form>
  );
}
