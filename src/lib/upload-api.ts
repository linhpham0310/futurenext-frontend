import { apiClient } from './api';

export async function getUploadUrl(courseId: string, fileName: string) {
  const response = await apiClient.get(`/courses/${courseId}/upload-url`, {
    params: { fileName, fileType: 'video/mp4' },
  });
  return response.data; // { uploadUrl, fileKey }
}
