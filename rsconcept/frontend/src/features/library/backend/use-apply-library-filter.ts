import { useAuth } from '@/features/auth/backend/use-auth';

import { applyLibraryFilter, type LibraryContextRestriction } from '../models/apply-library-filter';
import { type LibraryFilter } from '../models/library-filter';

import { useLibrary } from './use-library';

export function useApplyLibraryFilter(filter: LibraryFilter, context: LibraryContextRestriction) {
  const { items } = useLibrary();
  const { user } = useAuth();
  return { filtered: applyLibraryFilter(items, filter, user, context) };
}
