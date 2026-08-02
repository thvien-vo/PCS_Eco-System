import { AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
  className?: string;
}

export function ErrorState({ message, onRetry, className }: ErrorStateProps) {
  return (
    <div className={cn("flex flex-col items-center justify-center text-center p-6 h-full min-h-[250px]", className)}>
      <div className="bg-error/10 w-16 h-16 rounded-full flex items-center justify-center mb-4 text-error">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">Đã có lỗi xảy ra</h3>
      <p className="text-sm text-muted mb-6 max-w-[250px]">{message}</p>
      <Button onClick={onRetry} variant="outline" className="rounded-full px-6 border-border">
        Thử lại
      </Button>
    </div>
  );
}
