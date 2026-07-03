import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';

import { useAuth } from '@/features/auth/backend/use-auth';

import { DELAYS } from '@/backend/configuration';
import { usePreferencesStore } from '@/stores/preferences';
import { PARAMETER } from '@/utils/constants';

import {
  enabledContextSearchFields,
  type LibraryContextSearchFields
} from '../models/library-context-search';

import { libraryApi } from './api';

export function useLibraryContextSearch({
  query,
  contextFields,
  enabled
}: {
  query: string;
  contextFields: LibraryContextSearchFields;
  enabled: boolean;
}) {
  const { user } = useAuth();
  const adminMode = usePreferencesStore(state => state.adminMode);
  const isAdmin = user.is_staff && adminMode;
  const trimmedQuery = query.trim();
  const [debouncedQuery] = useDebounce(trimmedQuery, PARAMETER.searchDebounce);
  const activeFields = enabledContextSearchFields(contextFields);
  const isDebouncing = trimmedQuery !== debouncedQuery;

  const { data, isFetching, isLoading } = useQuery({
    queryKey: [...libraryApi.contextSearchKey, debouncedQuery, activeFields, isAdmin ? 'admin' : 'user'],
    queryFn: meta =>
      libraryApi.contextSearch({
        query: debouncedQuery,
        fields: activeFields,
        isAdmin,
        signal: meta.signal
      }),
    enabled: enabled && trimmedQuery.length > 0 && activeFields.length > 0,
    staleTime: DELAYS.staleMedium,
    placeholderData: previous => previous
  });

  const matchIds =
    debouncedQuery.length === 0
      ? null
      : activeFields.length === 0
        ? []
        : (data?.ids ?? null);
  const isPending =
    enabled &&
    trimmedQuery.length > 0 &&
    activeFields.length > 0 &&
    (isDebouncing || isLoading || isFetching);

  return { matchIds, isPending };
}
