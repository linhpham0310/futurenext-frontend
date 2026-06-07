'use client';

import { useState } from 'react';
import { getUploadUrl } from '@/lib/api/upload';

export default function VideoUploader({ courseId }: { courseId: string }) {
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);

      // 1. Lấy signed URL từ BE
      const { uploadUrl, fileKey } = await getUploadUrl(courseId, file.name);

      // 2. Upload trực tiếp lên Supabase
      const res = await fetch(uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!res.ok) throw new Error('Upload failed');

      // 3. Public URL (nếu bucket public)
      const publicUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/course-videos/${fileKey}`;

      setVideoUrl(publicUrl);
    } catch (err) {
      console.error(err);
      alert('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input type="file" onChange={handleUpload} />

      {loading && <p>Uploading...</p>}

      {videoUrl && <video src={videoUrl} controls width={400} />}
    </div>
  );
}
