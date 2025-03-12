import { urls, useConceptNavigation } from '@/app';
import { useAuthSuspense } from '@/features/auth';

export function HomePage() {
  const router = useConceptNavigation();
  const { isAnonymous } = useAuthSuspense();

  if (isAnonymous) {
    router.replace({ path: urls.manuals });
  } else {
    router.replace({ path: urls.library });
  }

  return null;
}
