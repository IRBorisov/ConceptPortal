'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

import { useAccessMode } from '@/context/AccessModeContext';
import { useConceptOptions } from '@/context/ConceptOptionsContext';
import useWindowSize from '@/hooks/useWindowSize';
import { ConstituentaID, IConstituenta, IRSForm } from '@/models/rsform';
import { UserLevel } from '@/models/user';
import { animateSideView } from '@/styling/animations';

import ConstituentsSearch from './ConstituentsSearch';
import TableSideConstituents from './TableSideConstituents';

// Window width cutoff for expression show
const COLUMN_EXPRESSION_HIDE_THRESHOLD = 1500;

// Window width cutoff for dense search bar
const COLUMN_DENSE_SEARCH_THRESHOLD = 1100;

interface ViewConstituentsProps {
  expression: string;
  isBottom?: boolean;
  activeCst?: IConstituenta;
  schema?: IRSForm;
  onOpenEdit: (cstID: ConstituentaID) => void;
}

function ViewConstituents({ expression, schema, activeCst, isBottom, onOpenEdit }: ViewConstituentsProps) {
  const { calculateHeight } = useConceptOptions();
  const windowSize = useWindowSize();
  const { accessLevel } = useAccessMode();

  const [filteredData, setFilteredData] = useState<IConstituenta[]>(schema?.items ?? []);

  const table = useMemo(
    () => (
      <TableSideConstituents
        maxHeight={
          isBottom
            ? calculateHeight(accessLevel !== UserLevel.READER ? '42rem' : '35rem', '10rem')
            : calculateHeight('8.2rem')
        }
        items={filteredData}
        activeCst={activeCst}
        onOpenEdit={onOpenEdit}
        denseThreshold={COLUMN_EXPRESSION_HIDE_THRESHOLD}
      />
    ),
    [isBottom, filteredData, activeCst, onOpenEdit, calculateHeight, accessLevel]
  );

  return (
    <motion.div
      className={clsx(
        'border overflow-visible', // prettier: split-lines
        {
          'mt-[2.2rem] rounded-l-md rounded-r-none h-fit': !isBottom,
          'mt-3 mx-6 rounded-md md:w-[45.8rem]': isBottom
        }
      )}
      initial={{ ...animateSideView.initial }}
      animate={{ ...animateSideView.animate }}
      exit={{ ...animateSideView.exit }}
    >
      <ConstituentsSearch
        dense={windowSize.width && windowSize.width < COLUMN_DENSE_SEARCH_THRESHOLD ? true : undefined}
        schema={schema}
        activeID={activeCst?.id}
        activeExpression={expression}
        setFiltered={setFilteredData}
      />
      {table}
    </motion.div>
  );
}

export default ViewConstituents;
