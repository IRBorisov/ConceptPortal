import { type Styling } from '../props';
import { cn } from '../utils';

interface ErrorFieldProps extends Styling {
  error?: string;
}

/**
 * Displays an error message for input field.
 */
export function ErrorField({ error, className, ...restProps }: ErrorFieldProps): React.ReactElement | null {
  if (!error) {
    return null;
  }
  return (
    <div className={cn('text-sm text-destructive select-none cursor-auto', className)} {...restProps}>
      {error}
    </div>
  );
}
