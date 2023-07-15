import { FallbackProps } from 'react-error-boundary';
import Button from './Common/Button';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className='flex flex-col items-center antialiased bg-gray-50 dark:bg-gray-800' role='alert'>
      <h1 className='text-lg font-semibold'>Something went wrong!</h1>
      <pre className='text-red-400'>Error message: {error.message}</pre>
      <Button onClick={resetErrorBoundary} text='Try again' />
    </div>
  );
}

export default ErrorFallback;