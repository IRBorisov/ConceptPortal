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

function DataLoader({ id, isLoading, hasNoData, error, children, ...restProps }: DataLoaderProps) {
  return (
    <AnimatePresence mode='wait'>
      {isLoading ? <Loader key={`${id}-loader`} /> : null}
      {error ? <InfoError key={`${id}-error`} error={error} /> : null}
      <AnimateFade id={id} key={`${id}-data`} removeContent={isLoading || !!error || hasNoData} {...restProps}>
        {children}
      </AnimateFade>
      <AnimateFade id={id} key={`${id}-data`} removeContent={isLoading || !!error || !hasNoData} {...restProps}>
        Данные не загружены
      </AnimateFade>
    </AnimatePresence>
  );
}

export default DataLoader;
