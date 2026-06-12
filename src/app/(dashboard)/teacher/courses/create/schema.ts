import { z } from 'zod';
export const courseSchema = z.object({
  title: z.string().min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
  description: z.string().optional(),
  price: z.number().min(0, 'Giá không được âm').default(0),
  thumbnailUrl: z.string().optional(),
});
export type CourseFormValues = z.infer<typeof courseSchema>;
