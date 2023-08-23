import { type FallbackProps } from 'react-error-boundary';

import Button from './Common/Button';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  console.log(error);
  return (
    <div className='flex flex-col items-center antialiased clr-app' role='alert'>
      <h1 className='text-lg font-semibold'>Something went wrong!</h1>
      { error  }
      <Button onClick={resetErrorBoundary} text='Try again' />
    </div>
  );
}

export default ErrorFallback;
