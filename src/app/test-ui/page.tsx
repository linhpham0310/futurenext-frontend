/**
 * @file Development page for testing core Shadcn UI components and theme toggling.
 * Access via /test-ui route. Should be removed or protected in production.
 */
'use client'; // Required for ThemeToggle and potentially other interactive tests

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { ThemeToggle } from '@/components/layout/theme-toggle'; // Import ThemeToggle

import { useForm } from 'react-hook-form'; // Import useForm for the Form structure test
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

export default function TestUiPage() {
  // Mock form for structure testing
  const form = useForm();

  return (
    <div className="container mx-auto p-6 md:p-10 space-y-8">
      {/* Theme Toggle Button */}
      <div className="fixed top-4 right-4 z-50">
        {' '}
        {/* Fixed position for easy access */}
        <ThemeToggle />
      </div>

      <h1 className="text-3xl font-bold tracking-tight mb-8 border-b pb-4">
        Shadcn UI Component Showcase (Task S1-FE-01)
      </h1>

      {/* Card for Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Various button styles and states.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Button>Default (Primary)</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link Button</Button>
          <Button disabled className="flex items-center gap-2">
            <Spinner className="h-4 w-4" />
            Loading
          </Button>
          <Button disabled>Disabled</Button>
          <Button size="lg">Large Button</Button>
          <Button size="sm">Small Button</Button>
          <Button size="icon" aria-label="Icon Button">
            <Spinner className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Card for Inputs & Labels */}
      <Card>
        <CardHeader>
          <CardTitle>Inputs & Labels</CardTitle>
          <CardDescription>Different input states and associated labels.</CardDescription>
        </CardHeader>
        <CardContent className="grid md:grid-cols-2 gap-6">
          {/* Standard Input with Label */}
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="email-std">Email Address</Label>
            <Input type="email" id="email-std" placeholder="you@example.com" />
            <p className="text-sm text-muted-foreground">Helper text below the input.</p>
          </div>
          {/* Input with Error State */}
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="pass-err">Password with Error</Label>
            <Input
              type="password"
              id="pass-err"
              placeholder="Password"
              className="border-destructive focus-visible:ring-destructive"
            />
            <p className="text-sm text-destructive">Password must be at least 8 characters.</p>
          </div>
          {/* Disabled Input */}
          <div className="grid w-full items-center gap-1.5">
            <Label htmlFor="disabled-input">Disabled Input</Label>
            <Input id="disabled-input" placeholder="Cannot type here" disabled />
          </div>
        </CardContent>
      </Card>

      {/* Card for Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Alerts</CardTitle>
          <CardDescription>Different alert variants for notifications.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            {/* <Icons.terminal className="h-4 w-4" /> Optional Icon */}
            <AlertTitle>Thông báo</AlertTitle>
            <AlertDescription>Đây là một thông báo mặc định.</AlertDescription>
          </Alert>
          <Alert variant="destructive">
            {/* <Icons.alertTriangle className="h-4 w-4" /> */}
            <AlertTitle>Lỗi!</AlertTitle>
            <AlertDescription>Đã có lỗi xảy ra, vui lòng thử lại.</AlertDescription>
          </Alert>
          <Alert variant="success">
            {/* <Icons.checkCircle className="h-4 w-4" /> */}
            <AlertTitle>Thành công!</AlertTitle>
            <AlertDescription>Hành động của bạn đã hoàn tất.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Card for Checkbox */}
      <Card>
        <CardHeader>
          <CardTitle>Checkbox</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center space-x-2">
          <Checkbox id="terms-test" />
          <Label htmlFor="terms-test" className="cursor-pointer">
            Tôi đồng ý với các điều khoản
          </Label>
        </CardContent>
      </Card>

      {/* Card for Form Component Structure (Visual Only) */}
      <Card>
        <CardHeader>
          <CardTitle>Form Structure (Visual Test using Shadcn Form)</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Bọc bằng <Form> để cung cấp context cho FormField */}
          <Form {...form}>
            <form className="space-y-4">
              <FormField
                control={form.control} // Cần control từ useForm
                name="testName" // Tên field giả định
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên mẫu</FormLabel>
                    <FormControl>
                      <Input placeholder="Nhập tên..." {...field} />
                    </FormControl>
                    <FormDescription>Đây là mô tả cho trường input.</FormDescription>
                    <FormMessage /> {/* Nơi hiển thị lỗi */}
                  </FormItem>
                )}
              />
              <Button type="button">Submit (Visual)</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
