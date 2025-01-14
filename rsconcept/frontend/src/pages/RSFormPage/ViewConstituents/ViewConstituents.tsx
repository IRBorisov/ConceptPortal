'use client';

import clsx from 'clsx';
import { useState } from 'react';

import { useAccessMode } from '@/context/AccessModeContext';
import useWindowSize from '@/hooks/useWindowSize';
import { ConstituentaID, IConstituenta, IRSForm } from '@/models/rsform';
import { UserLevel } from '@/models/user';
import { useFitHeight } from '@/stores/appLayout';
import { PARAMETER } from '@/utils/constants';

import ConstituentsSearch from './ConstituentsSearch';
import TableSideConstituents from './TableSideConstituents';

// Window width cutoff for dense search bar
const COLUMN_DENSE_SEARCH_THRESHOLD = 1100;

interface ViewConstituentsProps {
  expression: string;
  isBottom?: boolean;
  activeCst?: IConstituenta;
  schema?: IRSForm;
  onOpenEdit: (cstID: ConstituentaID) => void;
  isMounted: boolean;
}

function ViewConstituents({ expression, schema, activeCst, isBottom, onOpenEdit, isMounted }: ViewConstituentsProps) {
  const windowSize = useWindowSize();
  const { accessLevel } = useAccessMode();
  const listHeight = useFitHeight(!isBottom ? '8.2rem' : accessLevel !== UserLevel.READER ? '42rem' : '35rem', '10rem');

  const [filteredData, setFilteredData] = useState<IConstituenta[]>(schema?.items ?? []);

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
        dense={windowSize.width && windowSize.width < COLUMN_DENSE_SEARCH_THRESHOLD ? true : undefined}
        schema={schema}
        activeID={activeCst?.id}
        activeExpression={expression}
        setFiltered={setFilteredData}
      />
      <TableSideConstituents
        maxHeight={listHeight}
        items={filteredData}
        activeCst={activeCst}
        onOpenEdit={onOpenEdit}
        autoScroll={!isBottom}
      />
    </div>
  );
}

export default ViewConstituents;
