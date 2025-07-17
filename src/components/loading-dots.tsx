import { cn } from '@/lib/utils';

export function LoadingDots({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center space-x-1 p-2', className)}>
      <span className="sr-only">Loading...</span>
      <div className="h-1.5 w-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
      <div className="h-1.5 w-1.5 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
      <div className="h-1.5 w-1.5 bg-current rounded-full animate-bounce"></div>
    </div>
  );
}
