import { useState, useCallback } from 'react';
import { getApiErrorMessage } from '@/lib/api-error';

interface AsyncOperationState {
  isLoading: boolean;
  error: string | null;
  isSuccess: boolean;
}

interface AsyncOperationOptions {
  /** Default error message when extraction fails */
  fallbackError?: string;
  /** Reset success state automatically after this many ms (0 = never) */
  successResetMs?: number;
}

/**
 * Generic hook for async operations with loading/error/success state management.
 * Eliminates the repeated try/catch/finally + useState boilerplate.
 */
export function useAsyncOperation<TArgs extends unknown[], TResult>(
  operation: (...args: TArgs) => Promise<TResult>,
  options: AsyncOperationOptions = {}
) {
  const { fallbackError, successResetMs = 0 } = options;

  const [state, setState] = useState<AsyncOperationState>({
    isLoading: false,
    error: null,
    isSuccess: false,
  });

  const execute = useCallback(
    async (...args: TArgs): Promise<TResult | undefined> => {
      setState({ isLoading: true, error: null, isSuccess: false });
      try {
        const result = await operation(...args);
        setState({ isLoading: false, error: null, isSuccess: true });

        if (successResetMs > 0) {
          setTimeout(() => {
            setState((prev) => ({ ...prev, isSuccess: false }));
          }, successResetMs);
        }

        return result;
      } catch (error: unknown) {
        const message = getApiErrorMessage(error, fallbackError);
        setState({ isLoading: false, error: message, isSuccess: false });
        return undefined;
      }
    },
    [operation, fallbackError, successResetMs]
  );

  const reset = useCallback(() => {
    setState({ isLoading: false, error: null, isSuccess: false });
  }, []);

  return { ...state, execute, reset };
}
