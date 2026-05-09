'use client';

import { Outlet } from 'react-router';

import { useBrowserNavigation } from '@/hooks/use-browser-navigation';

import { UnsavedChangesState } from '../changes/unsaved-state';
import { NavigationState } from '../navigation';

export function LayoutRoot() {
  useBrowserNavigation();

  return (
    <UnsavedChangesState>
      <NavigationState>
        <Outlet />
      </NavigationState>
    </UnsavedChangesState>
  );
}
