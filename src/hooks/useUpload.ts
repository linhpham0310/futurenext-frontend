import { useState } from 'react';
import { courseApi } from '@/lib/api';
import { uploadFileToSupabase } from '@/lib/upload.service';
import { toast } from 'sonner';

export function useUpload(courseId: string) {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File, fileType: string) => {
    setIsUploading(true);
    setProgress(0);
    setError(null);
    try {
      // 1. Lấy signed URL từ backend
      const { uploadUrl, fileKey } = await courseApi.getUploadUrl(courseId, file.name, fileType);
      // 2. Upload file lên Supabase (hoặc S3)
      await uploadFileToSupabase(uploadUrl, file);
      setProgress(100);
      return { fileKey, success: true };
    } catch (err: any) {
      const msg = err?.message || 'Upload thất bại';
      setError(msg);
      toast.error(msg);
      return { success: false, error: msg };
    } finally {
      setIsUploading(false);
    }
  };

  return { upload, isUploading, progress, error };
}
