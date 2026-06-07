import { apiClient } from './api';

export async function getUploadUrl(courseId: string, fileName: string) {
  const res = await apiClient.get(
    `${process.env.NEXT_PUBLIC_API_URL}/courses/${courseId}/upload-url`,
    {
      params: { fileName },
      withCredentials: true,
    }
  );

  return res.data;
}
