import { useLayoutEffect } from 'react';

import { useAuth } from '@/context/AuthContext';
import { useConceptNavigation } from '@/context/NavigationContext';
import { TIMEOUT_UI_REFRESH } from '@/utils/constants';

function HomePage() {
  const router = useConceptNavigation();
  const { user } = useAuth();

  useLayoutEffect(() => {
    if (!user) {
      setTimeout(() => {
        router.push('/manuals');
      }, TIMEOUT_UI_REFRESH);
    } else {
      setTimeout(() => {
        router.push('/library');
      }, TIMEOUT_UI_REFRESH);
    }
  }, [router, user]);

  return <div />;
}

export default HomePage;
