import { useLayoutEffect } from 'react';

import { urls } from '@/app/urls';
import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { PARAMETER } from '@/utils/constants';

function HomePage() {
  const router = useConceptNavigation();
  const { user } = useAuth();

  useLayoutEffect(() => {
    if (!user) {
      setTimeout(() => {
        router.push(urls.manuals);
      }, PARAMETER.refreshTimeout);
    } else {
      setTimeout(() => {
        router.push(urls.library);
      }, PARAMETER.refreshTimeout);
    }
  }, [router, user]);

  return <div />;
}

export default HomePage;
