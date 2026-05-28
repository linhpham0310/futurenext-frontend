// src/lib/schemas/auth.schema.ts
import { z } from 'zod';

// Schema cho form đăng ký, bao gồm cả confirmPassword và refine để so sánh
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
      .transform((val) => val.toLowerCase().trim()), // Chuẩn hóa
    password: z
      .string()
      .min(8, { message: 'Mật khẩu phải có ít nhất 8 ký tự.' })
      .max(100, { message: 'Mật khẩu không được vượt quá 100 ký tự.' })
      .regex(/^(?=.*[A-Za-z])(?=.*\d)/, {
        message: 'Mật khẩu phải chứa ít nhất 1 chữ cái và 1 chữ số.',
      }),
    // Thêm confirmPassword
    confirmPassword: z.string().min(1, { message: 'Vui lòng xác nhận mật khẩu.' }),
    consentAccepted: z.boolean().refine((val) => val === true, {
      message: 'Bạn phải đồng ý với điều khoản để tiếp tục.',
    }),
    role: z.enum(['student', 'teacher'], {
      message: 'Vui lòng chọn vai trò của bạn',
    }),
  })
  // refine() để kiểm tra confirmPassword khớp với password
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
    path: ['confirmPassword'], // Gắn lỗi vào trường confirmPassword
  });

// Type được suy ra từ schema
export type RegisterFormData = z.infer<typeof registerSchema>;

export const verifyEmailSchema = z.object({
  // Email không còn là field trong form này vì đọc từ URL
  // email: z.string().email().optional(),
  otp: z.string().length(6, { message: 'Mã OTP phải có đúng 6 chữ số.' }),
});
// Type chỉ cần chứa OTP
export type VerifyEmailFormData = z.infer<typeof verifyEmailSchema>;

// Schema cho form đăng nhập
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email không được để trống.' })
    .email({ message: 'Email không đúng định dạng.' })
    .max(255)
    .transform((val) => val.toLowerCase().trim()), // Chuẩn hóa
  password: z
    .string()
    .min(1, { message: 'Mật khẩu không được để trống.' }) // Chỉ cần check trống
    .max(100, { message: 'Mật khẩu không được vượt quá 100 ký tự.' }),
});

// Type được suy ra từ schema
export type LoginFormData = z.infer<typeof loginSchema>;

// [SPRINT 2 - THÊM MỚI]
export const ForgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: 'Email không được để trống' })
    .email({ message: 'Địa chỉ email không hợp lệ' }),
});

export type ForgotPasswordInput = z.infer<typeof ForgotPasswordSchema>;

// [SPRINT 2 - THÊM MỚI]
export const ResetPasswordSchema = z
  .object({
    email: z.string().email({ message: 'Email không hợp lệ' }),
    otp: z.string().length(6, { message: 'Mã xác thực phải đúng 6 chữ số' }),
    password: z
      .string()
      .min(8, { message: 'Mật khẩu phải từ 8 ký tự trở lên' })
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/, {
        message: 'Mật khẩu cần ít nhất 1 chữ hoa, 1 chữ thường, 1 số và 1 ký tự đặc biệt',
      }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp',
    path: ['confirmPassword'],
  });

export type ResetPasswordInput = z.infer<typeof ResetPasswordSchema>;
