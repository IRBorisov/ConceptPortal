import { AnimatePresence } from 'framer-motion';

import AnimateFade from './AnimateFade';
import InfoError, { ErrorData } from './InfoError';
import { CProps } from './props';
import Loader from './ui/Loader';

interface DataLoaderProps extends CProps.AnimatedDiv {
  id: string;

  isLoading?: boolean;
  error?: ErrorData;
  hasNoData?: boolean;

  children: React.ReactNode;
}

function DataLoader({ id, isLoading, hasNoData, error, children, ...restProps }: DataLoaderProps) {
  return (
    <AnimatePresence mode='wait'>
      {isLoading ? <Loader key={`${id}-loader`} /> : null}
      {error ? <InfoError key={`${id}-error`} error={error} /> : null}
      {!isLoading && !error && !hasNoData ? (
        <AnimateFade id={id} key={`${id}-data`} {...restProps}>
          {children}
        </AnimateFade>
      ) : null}
      {!isLoading && !error && hasNoData ? (
        <AnimateFade id={id} key={`${id}-data`} {...restProps}>
          Данные не загружены
        </AnimateFade>
      ) : null}
    </AnimatePresence>
  );
}

export default DataLoader;
