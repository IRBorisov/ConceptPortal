import { urls, useConceptNavigation } from '@/app';
import { useAuthSuspense } from '@/features/auth';

export function HomePage() {
  const router = useConceptNavigation();
  const { isAnonymous } = useAuthSuspense();

  if (isAnonymous) {
    router.replace(urls.manuals);
  } else {
    router.replace(urls.library);
  }

  return null;
}
