import { useEffect } from 'react';

import { urls } from '@/app/urls';
import Loader from '@/components/ui/Loader';
import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { PARAMETER } from '@/utils/constants';

function HomePage() {
  const router = useConceptNavigation();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        setTimeout(() => {
          router.push(urls.manuals);
        }, PARAMETER.refreshTimeout);
      } else {
        setTimeout(() => {
          router.push(urls.library);
        }, PARAMETER.refreshTimeout);
      }
    }
  }, [router, user, loading]);

  return <Loader />;
}

export default HomePage;
