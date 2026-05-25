/**
 * @file Defines Zod schemas for user-related forms (e.g., update profile).
 */
import { z } from 'zod';

/**
 * Zod schema for updating user profile.
 * Includes fields allowed for update (fullName, avatarUrl)
 * and the 'updatedAt' timestamp required for Optimistic Locking [cite: 3692-3700].
 */
export const updateProfileSchema = z.object({
  fullName: z
    .string()
    .trim()
    .min(1, { message: 'Họ tên không được để trống.' })
    .max(100, { message: 'Họ tên không được vượt quá 100 ký tự.' })
    .optional(), // Cho phép optional nếu dùng chung

  avatarUrl: z
    .string()
    .url({ message: 'URL ảnh đại diện không hợp lệ.' })
    .max(1024, { message: 'URL ảnh đại diện quá dài.' })
    .nullable() // Cho phép gửi null để xóa avatar
    .optional(), // Cho phép optional

  // Trường này bắt buộc phải có để gửi đi, dùng để Optimistic Lock
  updatedAt: z.string().datetime({ message: "Timestamp 'updatedAt' không hợp lệ." }),
});

// Type inferred from the schema
export type UpdateProfileFormData = z.infer<typeof updateProfileSchema>;
