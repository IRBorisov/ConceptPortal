import { AnimatePresence } from 'framer-motion';

import AnimateFade from './AnimateFade';
import InfoError, { ErrorData } from './InfoError';
import Loader from './ui/Loader';

interface DataLoaderProps {
  id: string;

  isLoading: boolean;
  error?: ErrorData;
  hasNoData?: boolean;

  children: React.ReactNode;
}

function DataLoader({ id, isLoading, hasNoData, error, children }: DataLoaderProps) {
  return (
    <AnimatePresence mode='wait'>
      {isLoading ? <Loader key={`${id}-loader`} /> : null}
      {error ? <InfoError key={`${id}-error`} error={error} /> : null}
      {!isLoading && !error && !hasNoData ? (
        <AnimateFade id={id} key={`${id}-data`}>
          {children}
        </AnimateFade>
      ) : null}
    </AnimatePresence>
  );
}

export default DataLoader;
