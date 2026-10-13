import { useEffect } from 'react';
import { useSuspenseQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/backend/use-auth';

import { queryClient } from '@/backend/query-client';
import { usePreferencesStore } from '@/stores/preferences';

import { libraryApi } from './api';

function libraryAdminFlag(isStaff: boolean, adminMode: boolean): boolean {
  return isStaff && adminMode;
}

export function useLibraryListKey() {
  const adminMode = usePreferencesStore(state => state.adminMode);
  const { user } = useAuth();
  return libraryApi.getLibraryQueryOptions({ isAdmin: libraryAdminFlag(user.is_staff, adminMode) }).queryKey;
}

export function useLibrary() {
  const adminMode = usePreferencesStore(state => state.adminMode);
  const setAdminMode = usePreferencesStore(state => state.setAdminMode);
  const { user } = useAuth();
  const isAdmin = libraryAdminFlag(user.is_staff, adminMode);

  useEffect(
    function dropAdminLibraryCache() {
      if (isAdmin) {
        return;
      }
      queryClient.removeQueries({
        queryKey: libraryApi.getLibraryQueryOptions({ isAdmin: true }).queryKey
      });
    },
    [isAdmin]
  );

  const { data: items } = useSuspenseQuery({
    ...libraryApi.getLibraryQueryOptions({
      isAdmin,
      onAdminForbidden: () => setAdminMode(false)
    })
  });
  return { items };
}

export function prefetchLibrary() {
  return queryClient.prefetchQuery(libraryApi.getLibraryQueryOptions({ isAdmin: false }));
}
