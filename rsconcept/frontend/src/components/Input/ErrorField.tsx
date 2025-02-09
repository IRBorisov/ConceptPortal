import clsx from 'clsx';
import { FieldError, GlobalError } from 'react-hook-form';

import { CProps } from '../props';

interface ErrorFieldProps extends CProps.Styling {
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
    <div className={clsx('text-sm text-warn-600 select-none', className)} {...restProps}>
      {error.message}
    </div>
  );
}
