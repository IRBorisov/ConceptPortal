import { type FieldError, type GlobalError } from 'react-hook-form';
import clsx from 'clsx';

import { type Styling } from '../props';

interface ErrorFieldProps extends Styling {
  error?: FieldError | GlobalError;
}

/**
 * Displays an error message for input field.
 */
export function ErrorField({ error, className, ...restProps }: ErrorFieldProps): React.ReactElement | null {
  if (!error) {
    return null;
  }
  return (
    <div className={clsx('text-sm text-destructive select-none', className)} {...restProps}>
      {error.message}
    </div>
  );
}
