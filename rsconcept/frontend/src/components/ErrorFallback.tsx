import { type FallbackProps } from 'react-error-boundary';

import Button from './common/Button';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  reportError(error);
  return (
    <div className='flex flex-col items-center antialiased clr-app' role='alert'>
      <h1 className='text-lg font-semibold'>Что-то пошло не так!</h1>
      {error}
      <Button onClick={resetErrorBoundary} text='Попробовать еще раз' />
    </div>
  );
}

export default ErrorFallback;
