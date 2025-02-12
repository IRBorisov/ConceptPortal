import { useEffect } from 'react';

import { urls, useConceptNavigation } from '@/app';
import { useAuthSuspense } from '@/features/auth';

import { Loader } from '@/components/Loader';
import { PARAMETER } from '@/utils/constants';

function HomePage() {
  const router = useConceptNavigation();
  const { isAnonymous } = useAuthSuspense();

  useEffect(() => {
    if (isAnonymous) {
      setTimeout(() => {
        router.replace(urls.manuals);
      }, PARAMETER.refreshTimeout);
    } else {
      setTimeout(() => {
        router.replace(urls.library);
      }, PARAMETER.refreshTimeout);
    }
  }, [router, isAnonymous]);

  return <Loader />;
}

export default HomePage;
