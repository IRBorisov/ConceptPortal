import { type FallbackProps } from 'react-error-boundary';

import InfoError from '../components/InfoError';
import Button from '../components/ui/Button';

function ErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className='flex flex-col items-center antialiased clr-app' role='alert'>
      <h1>Что-то пошло не так!</h1>
      <Button onClick={resetErrorBoundary} text='Попробовать еще раз' />
      <InfoError error={error as Error} />
    </div>
  );
}

export default ErrorFallback;
