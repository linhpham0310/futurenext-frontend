import axios from 'axios';

/**
 * Extracts a user-friendly error message from an unknown caught error.
 * Handles Axios errors, the app's simplified error format, and generic Error objects.
 */
export function getApiErrorMessage(error: unknown, fallback = 'Đã xảy ra lỗi không mong muốn.'): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message || error.message || fallback;
  }

  if (isAppError(error)) {
    return error.message || fallback;
  }

  if (error instanceof Error) {
    return error.message || fallback;
  }

  return fallback;
}

/**
 * Extracts the HTTP status code from a caught error, if available.
 */
export function getApiErrorStatus(error: unknown): number | undefined {
  if (axios.isAxiosError(error)) {
    return error.response?.status;
  }

  if (isAppError(error)) {
    return error.statusCode;
  }

  return undefined;
}

interface AppError {
  message?: string;
  statusCode?: number;
  error?: string;
}

function isAppError(value: unknown): value is AppError {
  return (
    typeof value === 'object' &&
    value !== null &&
    ('message' in value || 'statusCode' in value)
  );
}
