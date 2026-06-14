import { STATUS_CONFIG } from '../../types';
import type { ApplicationStatus } from '../../types';
import { cn } from '../../utils/cn';

interface Props {
  status: ApplicationStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge = ({ status, size = 'md' }: Props) => {
  const config = STATUS_CONFIG[status];
  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 font-medium rounded-md border-0',
      config.bg, config.color,
      size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
    )}>
      <span className={cn('rounded-full', config.dot, size === 'sm' ? 'w-1.5 h-1.5' : 'w-2 h-2')} />
      {config.label}
    </span>
  );
};
