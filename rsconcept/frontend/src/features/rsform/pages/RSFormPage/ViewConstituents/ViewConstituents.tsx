'use client';

import { useState } from 'react';
import clsx from 'clsx';

import { useRoleStore, UserRole } from '@/features/users';

import { useWindowSize } from '@/hooks/useWindowSize';
import { useFitHeight } from '@/stores/appLayout';
import { PARAMETER } from '@/utils/constants';

import { IConstituenta } from '../../../models/rsform';
import { useRSEdit } from '../RSEditContext';

import { ConstituentsSearch } from './ConstituentsSearch';
import { TableSideConstituents } from './TableSideConstituents';

// Window width cutoff for dense search bar
const COLUMN_DENSE_SEARCH_THRESHOLD = 1100;

interface ViewConstituentsProps {
  isBottom?: boolean;
  isMounted: boolean;
}

export function ViewConstituents({ isBottom, isMounted }: ViewConstituentsProps) {
  const windowSize = useWindowSize();
  const role = useRoleStore(state => state.role);
  const listHeight = useFitHeight(!isBottom ? '8.2rem' : role !== UserRole.READER ? '42rem' : '35rem', '10rem');
  const { schema, activeCst, navigateCst } = useRSEdit();

  const [filteredData, setFilteredData] = useState<IConstituenta[]>(schema.items);

  return (
    <div
      className={clsx(
        'border', // prettier: split-lines
        {
          'mt-[2.2rem] rounded-l-md rounded-r-none h-fit overflow-visible': !isBottom,
          'mt-3 mx-6 rounded-md md:max-w-[45.8rem] overflow-hidden': isBottom
        }
      )}
      style={{
        transitionProperty: 'opacity, width',
        transitionDuration: `${2 * PARAMETER.moveDuration}ms`,
        transitionTimingFunction: 'ease-in-out',
        opacity: isMounted ? 1 : 0,
        width: isMounted ? 'fit-content' : '0'
      }}
    >
      <ConstituentsSearch
        dense={!!windowSize.width && windowSize.width < COLUMN_DENSE_SEARCH_THRESHOLD}
        schema={schema}
        activeID={activeCst?.id}
        onChange={setFilteredData}
      />
      <TableSideConstituents
        maxHeight={listHeight}
        items={filteredData}
        activeCst={activeCst}
        onOpenEdit={navigateCst}
        autoScroll={!isBottom}
      />
    </div>
  );
}
