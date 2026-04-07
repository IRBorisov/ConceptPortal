'use client';

import { Outlet } from 'react-router';

import { useBrowserNavigation } from '@/hooks/use-browser-navigation';

import { NavigationState } from './navigation';

export function LayoutRoot() {
  useBrowserNavigation();

  return (
    <NavigationState>
      <Outlet />
    </NavigationState>
  );
}
