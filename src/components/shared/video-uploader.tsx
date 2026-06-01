'use client';
import React, { useState } from 'react';
import axios from 'axios';
import { Upload, FileVideo, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface VideoUploaderProps {
  courseId: string;
  onSuccess: (fileKey: string, duration?: number) => void;
}

// TASK S3-CM-05: Component xử lý Upload Video trực tiếp lên S3 với Progress Bar
export const VideoUploader = ({ courseId, onSuccess }: VideoUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>(
    'idle'
  );

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Kiểm tra định dạng (Client-side validation)
    if (!file.type.startsWith('video/')) {
      toast.error('Vui lòng chỉ chọn định dạng video!');
      return;
    }

    try {
      setUploadStatus('uploading');
      setIsUploading(true);
      setProgress(0);

      // 1. Lấy Presigned URL từ Backend (Gọi API từ Task 3.2)
      const { data } = await axios.get(`/courses/${courseId}/upload-url`, {
        params: {
          fileName: file.name,
          fileType: file.type,
        },
      });

      const { uploadUrl, fileKey } = data;

      // 2. Upload trực tiếp lên S3 sử dụng PUT request (Task S3-CM-05)
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / (progressEvent.total || file.size)
          );
          setProgress(percentCompleted);
        },
      });

      // 3. Xử lý sau khi upload thành công
      setUploadStatus('success');
      toast.success('Tải video lên thành công!');

      // Trả fileKey về cho component cha để gọi API UpdateContent (Task 3.3)
      onSuccess(fileKey);
    } catch (error) {
      setUploadStatus('error');
      toast.error('Lỗi khi tải video lên S3');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="w-full p-6 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 flex flex-col items-center justify-center space-y-4">
      {uploadStatus === 'idle' && (
        <>
          <div className="p-4 bg-blue-100 rounded-full">
            <Upload className="text-blue-600 w-8 h-8" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-700">Nhấn để chọn hoặc kéo thả video</p>
            <p className="text-xs text-gray-500">MP4, WebM hoặc Ogg (Tối đa 500MB)</p>
          </div>
          <input
            type="file"
            accept="video/*"
            className="hidden"
            id="video-upload"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          <label
            htmlFor="video-upload"
            className="cursor-pointer px-4 py-2 bg-white border border-gray-300 rounded-md text-sm hover:bg-gray-50 transition"
          >
            Chọn file
          </label>
        </>
      )}

      {uploadStatus === 'uploading' && (
        <div className="w-full space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2">
              <Loader2 className="animate-spin w-4 h-4 text-blue-600" />
              Đang tải lên...
            </span>
            <span className="font-bold">{progress}%</span>
          </div>
          {/* Progress Bar (Task S3-CM-05) */}
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}

      {uploadStatus === 'success' && (
        <div className="flex flex-col items-center gap-2 text-green-600">
          <CheckCircle2 className="w-10 h-10" />
          <span className="text-sm font-medium">Video đã sẵn sàng!</span>
          <button
            onClick={() => setUploadStatus('idle')}
            className="text-xs text-gray-500 underline"
          >
            Tải lên file khác
          </button>
        </div>
      )}

      {uploadStatus === 'error' && (
        <div className="flex flex-col items-center gap-2 text-red-600">
          <XCircle className="w-10 h-10" />
          <span className="text-sm font-medium">Tải lên thất bại</span>
          <button
            onClick={() => setUploadStatus('idle')}
            className="text-xs text-gray-500 underline"
          >
            Thử lại
          </button>
        </div>
      )}
    </div>
  );
};
