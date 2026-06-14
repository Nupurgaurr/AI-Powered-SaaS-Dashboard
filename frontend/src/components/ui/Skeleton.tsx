import { cn } from '../../utils/cn';

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse bg-gray-200 dark:bg-gray-700 rounded-lg', className)} />
);
