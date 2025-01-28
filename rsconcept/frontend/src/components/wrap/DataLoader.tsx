import InfoError, { ErrorData } from '@/components/info/InfoError';
import Loader from '@/components/ui/Loader';

interface DataLoaderProps {
  isLoading?: boolean;
  error?: ErrorData;
  hasNoData?: boolean;
}

function DataLoader({ isLoading, hasNoData, error, children }: React.PropsWithChildren<DataLoaderProps>) {
  if (isLoading) {
    return <Loader />;
  }
  if (error) {
    return <InfoError error={error} />;
  }

  if (hasNoData) {
    return <div className='cc-fade-in w-full text-center p-1'>Данные не загружены</div>;
  } else {
    return <>{children}</>;
  }
}

export default DataLoader;
