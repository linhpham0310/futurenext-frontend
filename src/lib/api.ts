// src/lib/api.ts
import axios from 'axios';

// --- Đọc Base URL từ Biến Môi trường ---
// Biến này sẽ được định nghĩa trong .env.local (Task SO-FE-04)
const baseURL = process.env.NEXT_PUBLIC_API_BASE_URL;

// Cảnh báo nếu thiếu Base URL
if (!baseURL) {
  console.warn(
    '[API Client] NEXT_PUBLIC_API_BASE_URL is not defined. Falling back to: http://localhost:3000'
  );
}

/**
 * Axios instance được cấu hình sẵn để giao tiếp với backend API (Core Service).
 * Bao gồm baseURL đọc từ biến môi trường.
 * Interceptors (để xử lý token, lỗi tập trung) sẽ được thêm ở Sprint 1 (Task S1-FE-06).
 */
const api = axios.create({
  //  Sử dụng baseURL đã đọc, với fallback an toàn cho local dev.
  baseURL: baseURL || 'http://localhost:3000',
  //  Đặt header mặc định cho các request (nếu cần).
  headers: {
    'Content-Type': 'application/json', // Mặc định gửi JSON
    Accept: 'application/json', // Mặc định chấp nhận JSON response
  },
  //  (Quan trọng cho Cookie Refresh Token sau này - Sẽ thêm ở Sprint 1)
  // withCredentials: true, // Cho phép trình duyệt tự động gửi/nhận cookie cross-site (nếu backend CORS cấu hình đúng)
  //  Timeout (Tùy chọn): Ngăn request treo quá lâu (ví dụ: 30 giây)
  // timeout: 30000,
});

// --- (Nơi thêm Interceptors ở Sprint 1) ---
// api.interceptors.request.use( async (config) => { ... });
// api.interceptors.response.use( (response) => { ... }, async (error) => { ... });

console.log(`[API Client] Initialized with baseURL: ${api.defaults.baseURL}`);

// Xuất instance để các hooks/components khác có thể import và sử dụng
export default api;

// --- (Tùy chọn) Định nghĩa Logger class đơn giản ---
// Có thể đặt trong src/lib/logger.ts
// class Logger {
//   constructor(private context: string = '') {}
//   log(...args: any[]) { console.log(this.context, ...args); }
//   warn(...args: any[]) { console.warn(this.context, ...args); }
//   error(...args: any[]) { console.error(this.context, ...args); }
// }
