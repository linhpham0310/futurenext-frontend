// src/lib/schemas/auth.schema.ts
import { z } from 'zod';

// Register schema
export const registerSchema = z
  .object({
    fullName: z
      .string()
      .trim()
      .min(1, { message: 'Họ tên không được để trống.' })
      .max(100, { message: 'Họ tên không được vượt quá 100 ký tự.' }),
    email: z
      .string()
      .min(1, { message: 'Email không được để trống.' })
      .email({ message: 'Email không đúng định dạng.' })
      .max(255, { message: 'Email không được vượt quá 255 ký tự.' })
      .transform((val) => val.toLowerCase().trim()),
    password: z
      .string()
      .min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự.' })
      .max(100, { message: 'Mật khẩu không được vượt quá 100 ký tự.' })
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, {
        message: 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số.',
      }),
    confirmPassword: z.string().min(1, { message: 'Vui lòng xác nhận mật khẩu.' }),
    consentAccepted: z.boolean().refine((val) => val === true, {
      message: 'Bạn phải đồng ý với điều khoản để tiếp tục.',
    }),
    role: z.enum(['student', 'teacher'], {
      message: 'Vui lòng chọn vai trò của bạn',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
    path: ['confirmPassword'],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;

// Verify email schema
export const verifyEmailSchema = z.object({
  email: z
    .string()
    .email({ message: 'Email không hợp lệ' })
    .transform((val) => val.toLowerCase().trim()),
  otp: z.string().length(6, { message: 'Mã OTP phải có đúng 6 chữ số.' }),
});
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

// OTP schema
export const otpOnlySchema = z.object({
  otp: z.string().length(6, { message: 'Mã OTP phải có đúng 6 chữ số.' }),
});
export type OtpOnlyFormData = z.infer<typeof otpOnlySchema>;

// Login schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email không được để trống.' })
    .email({ message: 'Email không đúng định dạng.' })
    .max(255)
    .transform((val) => val.toLowerCase().trim()),
  password: z.string().min(1, { message: 'Mật khẩu không được để trống.' }).max(100),
});
export type LoginFormData = z.infer<typeof loginSchema>;

// Forgot password schema
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email không được để trống' })
    .email({ message: 'Địa chỉ email không hợp lệ' }),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

// Reset password schema
export const resetPasswordSchema = z
  .object({
    email: z.string().email({ message: 'Email không hợp lệ' }),
    otp: z.string().length(6, { message: 'Mã xác thực phải đúng 6 chữ số' }),
    newPassword: z
      .string()
      .min(8, { message: 'Mật khẩu phải từ 8 ký tự trở lên' })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Mật khẩu cần ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
      }),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmNewPassword'],
  });
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;
