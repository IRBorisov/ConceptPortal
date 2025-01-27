import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { useAuthSuspense } from '@/backend/auth/useAuth';
import { libraryApi } from './api';

export function useLibrarySuspense() {
  const { user } = useAuthSuspense();
  const { data: items } = useSuspenseQuery({
    ...libraryApi.getLibraryQueryOptions({ isAdmin: user?.is_staff ?? false })
  });
  return { items };
}

export function useLibrary() {
  // NOTE: Using suspense here to avoid duplicated library data requests
  const { user } = useAuthSuspense();
  const { data: items, isLoading } = useQuery({
    ...libraryApi.getLibraryQueryOptions({ isAdmin: user?.is_staff ?? false })
  });
  return { items: items ?? [], isLoading };
}
