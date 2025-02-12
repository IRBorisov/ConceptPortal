import { useQuery, useSuspenseQuery } from '@tanstack/react-query';

import { useAuthSuspense } from '@/features/auth';

import { queryClient } from '@/backend/queryClient';
import { usePreferencesStore } from '@/stores/preferences';

import { libraryApi } from './api';

export function useLibrarySuspense() {
  const adminMode = usePreferencesStore(state => state.adminMode);
  const { user } = useAuthSuspense();
  const { data: items } = useSuspenseQuery({
    ...libraryApi.getLibraryQueryOptions({ isAdmin: user.is_staff && adminMode })
  });
  return { items };
}

export function useLibrary() {
  const adminMode = usePreferencesStore(state => state.adminMode);
  const { user } = useAuthSuspense();
  const { data: items, isLoading } = useQuery({
    ...libraryApi.getLibraryQueryOptions({ isAdmin: user.is_staff && adminMode })
  });
  return { items: items ?? [], isLoading };
}

export function prefetchLibrary() {
  return queryClient.prefetchQuery(libraryApi.getLibraryQueryOptions({ isAdmin: false }));
}
