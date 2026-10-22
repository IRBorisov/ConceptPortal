'use client';

import { ViewTransition } from 'react';
import { useMatches } from 'react-router';

/**
 * Cross-fades route content when the matched leaf route changes.
 *
 * Keyed by leaf route id so only real route changes run enter/exit animations;
 * query-only updates (tab switches, active item) keep the boundary mounted and do not animate.
 */
export function RouteTransition({ children }: React.PropsWithChildren) {
  const matches = useMatches();
  const routeID = matches.at(-1)?.id;

  return (
    <ViewTransition key={routeID} default='none' enter='auto' exit='auto'>
      {children}
    </ViewTransition>
  );
}
