'use client';
import { useState } from 'react';
import { CheckCircle, XCircle } from 'lucide-react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
interface ReviewActionFormProps {
  courseId: string;
}
// TASK S4-CM-06: Form phê duyệt/từ chối dành cho Admin
export const ReviewActionForm = ({ courseId }: ReviewActionFormProps) => {
  const router = useRouter();
  const [status, setStatus] = useState<'PUBLISHED' | 'REJECTED' | null>(null);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const onProcess = async () => {
    if (!status) return;
    if (status === 'REJECTED' && !reason) {
      toast.error('Vui lòng nhập lý do từ chối');
      return;
    }
    try {
      setIsSubmitting(true);
      // Gọi API processReview từ Task 4.3
      await axios.patch(`/courses/${courseId}/review`, {
        action: status,
        reason: reason,
      });
      toast.success(status === 'PUBLISHED' ? 'Đã xuất bản khóa học!' : 'Đã từ chối khóa học');
      router.push('/admin/pending-courses'); // Quay lại danh sách chờ duyệt
    } catch (error) {
      toast.error('Có lỗi xảy ra khi xử lý');
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 shadow-lg z-50">
      <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={() => setStatus('PUBLISHED')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md border ${
              status === 'PUBLISHED' ? 'bg-green-600 text-white' : 'bg-white'
            }`}
          >
            <CheckCircle size={18} /> Phê duyệt
          </button>
          <button
            onClick={() => setStatus('REJECTED')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md border ${
              status === 'REJECTED' ? 'bg-red-600 text-white' : 'bg-white'
            }`}
          >
            <XCircle size={18} /> Từ chối
          </button>
        </div>
        {status === 'REJECTED' && (
          <input
            className="flex-1 p-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-red-500"
            placeholder="Lý do từ chối (bắt buộc)..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />
        )}
        <button
          disabled={!status || isSubmitting}
          onClick={onProcess}
          className="ml-auto px-6 py-2 bg-gray-900 text-white rounded-md hover:bg-black disabled:bg-gray-300"
        >
          {isSubmitting ? 'Đang xử lý...' : 'Xác nhận kết quả'}
        </button>
      </div>
    </div>
  );
};
