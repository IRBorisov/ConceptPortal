import { urls, useConceptNavigation } from '@/app';
import { useAuthSuspense } from '@/features/auth';

import { PARAMETER } from '@/utils/constants';

export function HomePage() {
  const router = useConceptNavigation();
  const { isAnonymous } = useAuthSuspense();

  if (isAnonymous) {
    // Note: Timeout is needed to let router initialize
    setTimeout(() => router.replace({ path: urls.login }), PARAMETER.minimalTimeout);
  } else {
    setTimeout(() => router.replace({ path: urls.library }), PARAMETER.minimalTimeout);
  }

  return null;
}
