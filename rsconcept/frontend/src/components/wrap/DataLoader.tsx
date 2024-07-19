import { AnimatePresence } from 'framer-motion';

import InfoError, { ErrorData } from '../info/InfoError';
import { CProps } from '../props';
import Loader from '../ui/Loader';
import AnimateFade from './AnimateFade';

interface DataLoaderProps extends CProps.AnimatedDiv {
  id: string;

  isLoading?: boolean;
  error?: ErrorData;
  hasNoData?: boolean;

  children: React.ReactNode;
}

function DataLoader({ id, isLoading, hasNoData, error, className, children, ...restProps }: DataLoaderProps) {
  return (
    <AnimatePresence mode='wait'>
      {!isLoading && !error && !hasNoData ? (
        <AnimateFade id={id} key={`${id}-data`} className={className} {...restProps}>
          {children}
        </AnimateFade>
      ) : null}
      {!isLoading && !error && hasNoData ? (
        <AnimateFade key={`${id}-no-data`} className='w-full text-center p-1' {...restProps}>
          Данные не загружены
        </AnimateFade>
      ) : null}
      {isLoading ? <Loader key={`${id}-loader`} /> : null}
      {error ? <InfoError key={`${id}-error`} error={error} /> : null}
    </AnimatePresence>
  );
}

export default DataLoader;
