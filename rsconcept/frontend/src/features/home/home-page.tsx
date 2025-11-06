'use client';

import { useEffect } from 'react';

import { urls, useConceptNavigation } from '@/app';
import { useAuthSuspense } from '@/features/auth';

import { PARAMETER } from '@/utils/constants';

export function HomePage() {
  const router = useConceptNavigation();
  const { isAnonymous } = useAuthSuspense();

  useEffect(() => {
    // Note: Timeout is needed to let router initialize
    const timeoutId = setTimeout(() => {
      router.replace({ path: isAnonymous ? urls.login : urls.library });
    }, PARAMETER.minimalTimeout);

    return () => clearTimeout(timeoutId);
  }, [router, isAnonymous]);

  return null;
}
