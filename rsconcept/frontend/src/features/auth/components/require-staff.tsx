'use client';

import { Outlet } from 'react-router';

import { NotFoundPage } from '@/features/home/not-found-page';

import { useAuth } from '../backend/use-auth';

/**
 * Layout route: renders children only for staff users, otherwise the 404 page.
 *
 * Diagnostic pages (Sentry probes, DB schema, icon gallery) are useful in production for
 * staff but must not be discoverable by anonymous visitors. The check is client-side and
 * complements — does not replace — server-side authorization on any data they load.
 */
export function RequireStaff() {
  const { user } = useAuth();
  if (!user.is_staff) {
    return <NotFoundPage />;
  }
  return <Outlet />;
}
