'use client';

import clsx from 'clsx';

import { useRoleStore, UserRole } from '@/features/users';

import { useWindowSize } from '@/hooks/useWindowSize';
import { useFitHeight } from '@/stores/appLayout';
import { PARAMETER } from '@/utils/constants';

import { ConstituentsSearch } from './ConstituentsSearch';
import { TableSideConstituents } from './TableSideConstituents';

// Window width cutoff for dense search bar
const COLUMN_DENSE_SEARCH_THRESHOLD = 1100;

interface ViewConstituentsProps {
  className?: string;
  isBottom?: boolean;
  isMounted: boolean;
}

export function ViewConstituents({ className, isBottom, isMounted }: ViewConstituentsProps) {
  const windowSize = useWindowSize();
  const role = useRoleStore(state => state.role);
  const listHeight = useFitHeight(!isBottom ? '8.2rem' : role !== UserRole.READER ? '42rem' : '35rem', '10rem');

  return (
    <aside
      className={clsx(
        'border',
        {
          'rounded-l-md rounded-r-none': !isBottom,
          'rounded-md': isBottom
        },
        className
      )}
      style={{
        willChange: 'opacity, max-width',
        transitionProperty: 'opacity, max-width',
        transitionDuration: `${2 * PARAMETER.moveDuration}ms`,
        transitionTimingFunction: 'ease-in-out',
        opacity: isMounted ? 1 : 0,
        maxWidth: isMounted ? '100%' : '0'
      }}
    >
      <ConstituentsSearch dense={!!windowSize.width && windowSize.width < COLUMN_DENSE_SEARCH_THRESHOLD} />
      <TableSideConstituents maxHeight={listHeight} autoScroll={!isBottom} />
    </aside>
  );
}
