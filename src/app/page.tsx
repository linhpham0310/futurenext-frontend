'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

export default function HomePage() {
  const [backendStatus, setBackendStatus] = useState<string>('Đang kiểm tra kết nối...');
  const [error, setError] = useState<string | null>(null);

  const apiUrl = api.defaults.baseURL || 'N/A';

  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        setError(null);
        const response = await api.get('/health');
        if (response.status === 200 && response.data?.status === 'ok') {
          setBackendStatus('Backend đang hoạt động! ✅');
        } else {
          setBackendStatus(`Trạng thái không mong đợi (${response.status})`);
        }
      } catch (err: unknown) {
        console.error('Health check failed:', err);

        let msg = 'Kết nối tới backend thất bại.';
        if (err instanceof Error) {
          msg += ` ${err.message}`;
        }
        setError(msg);
        setBackendStatus('Kết nối thất bại ❌');
      }
    };

    checkBackendHealth();
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-lg w-full">
        <h1 className="text-4xl font-bold mb-4 text-indigo-700">FutureNext.ai</h1>
        <p className="text-lg text-gray-600 mb-6">Nền tảng học lập trình AI-First</p>
        <div className="mt-6 p-4 border border-gray-200 rounded bg-gray-50 text-left">
          <p className="font-semibold text-gray-800">Trạng thái Backend:</p>
          <p className={`mt-1 font-medium ${error ? 'text-red-600' : 'text-green-600'}`}>
            {backendStatus}
          </p>
          {apiUrl && <p className="text-xs text-gray-400 mt-2">URL: {apiUrl}</p>}
          {error && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
              {error}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
