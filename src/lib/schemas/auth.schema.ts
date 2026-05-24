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
    role: z.enum(['student', 'teacher']),
    consentAccepted: z.boolean().refine((val) => val === true, {
      message: 'Bạn phải đồng ý với điều khoản để tiếp tục.',
    }),
  })
  // refine() để kiểm tra confirmPassword khớp với password
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp.',
    path: ['confirmPassword'], // Gắn lỗi vào trường confirmPassword
  });

// Type được suy ra từ schema
export type RegisterFormData = z.infer<typeof registerSchema>;

// ... (verifyEmailSchema và các schema khác...)
