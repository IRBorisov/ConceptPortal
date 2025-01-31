import { FieldError, GlobalError } from 'react-hook-form';

interface ErrorFieldProps {
  error?: FieldError | GlobalError;
}

/**
 * Displays an error message for input field.
 */
function ErrorField({ error }: ErrorFieldProps) {
  if (!error) {
    return null;
  }
  return <div className='text-sm text-warn-600'>{error.message}</div>;
}

export default ErrorField;
