'use client';

import { Outlet } from 'react-router';

import { useBrowserNavigation } from '@/hooks/use-browser-navigation';

import { NavigationState } from './navigation/navigation-context';

export function LayoutRoot() {
  useBrowserNavigation();

  return (
    <NavigationState>
      <Outlet />
    </NavigationState>
  );
}
