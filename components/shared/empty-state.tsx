import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, actionLabel, onAction, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-8 h-full min-h-[300px]", className)}>
      <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted mb-6 max-w-[250px]">{description}</p>
      {actionLabel && onAction && (
        <Button onClick={onAction} className="bg-emerald hover:bg-emerald-hover text-white rounded-full px-6">
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
