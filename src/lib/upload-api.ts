import { courseApi } from './api';

export async function getUploadUrl(courseId: string, fileName: string) {
  const data = await courseApi.getUploadUrl(courseId, fileName, 'video/mp4');

  return data; // { uploadUrl, fileKey }
}
