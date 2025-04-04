'use client';

import clsx from 'clsx';

import { useRoleStore, UserRole } from '@/features/users';

import { useWindowSize } from '@/hooks/use-window-size';
import { useFitHeight } from '@/stores/app-layout';

import { ConstituentsSearch } from './constituents-search';
import { TableSideConstituents } from './table-side-constituents';

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
        isBottom ? 'rounded-md' : 'rounded-l-md rounded-r-none',
        isMounted ? 'max-w-full' : 'opacity-0 max-w-0',
        'ease-in-out duration-1000 transition-[opacity,max-width]',
        className
      )}
    >
      <ConstituentsSearch dense={!!windowSize.width && windowSize.width < COLUMN_DENSE_SEARCH_THRESHOLD} />
      <TableSideConstituents maxHeight={listHeight} autoScroll={!isBottom} />
    </aside>
  );
}
