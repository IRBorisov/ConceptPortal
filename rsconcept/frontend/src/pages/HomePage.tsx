import { useEffect } from 'react';

import { useConceptNavigation } from '@/app/Navigation/NavigationContext';
import { urls } from '@/app/urls';
import { useAuthSuspense } from '@/backend/auth/useAuth';
import Loader from '@/components/ui/Loader';
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
