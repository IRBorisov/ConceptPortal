import { useEffect } from 'react';

import { urls, useConceptNavigation } from '@/app';
import { Loader } from '@/components/Loader';
import { useAuthSuspense } from '@/features/auth/backend/useAuth';
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
