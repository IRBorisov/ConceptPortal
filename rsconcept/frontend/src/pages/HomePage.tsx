import { useEffect } from 'react';

import { useConceptNavigation } from '@/app/Navigation/NavigationContext';
import { urls } from '@/app/urls';
import { useAuth } from '@/backend/auth/useAuth';
import Loader from '@/components/ui/Loader';
import { PARAMETER } from '@/utils/constants';

function HomePage() {
  const router = useConceptNavigation();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        setTimeout(() => {
          router.replace(urls.manuals);
        }, PARAMETER.refreshTimeout);
      } else {
        setTimeout(() => {
          router.replace(urls.library);
        }, PARAMETER.refreshTimeout);
      }
    }
  }, [router, user, isLoading]);

  return <Loader />;
}

export default HomePage;
