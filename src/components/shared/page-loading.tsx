import { Spinner } from '@/components/ui/spinner';

interface PageLoadingProps {
  fullScreen?: boolean;
  className?: string;
}

export function PageLoading({ fullScreen = false, className }: PageLoadingProps) {
  if (fullScreen) {
    return (
      <div className={className ?? 'flex items-center justify-center min-h-screen'}>
        <Spinner className="h-10 w-10" />
      </div>
    );
  }

  return (
    <div className={className ?? 'flex justify-center p-10'}>
      <Spinner />
    </div>
  );
}
