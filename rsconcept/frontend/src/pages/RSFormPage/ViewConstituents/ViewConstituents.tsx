'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

import { useConceptOptions } from '@/context/OptionsContext';
import { ConstituentaID, IConstituenta, IRSForm } from '@/models/rsform';
import { animateSideView } from '@/styling/animations';

import ConstituentsSearch from './ConstituentsSearch';
import ConstituentsTable from './ConstituentsTable';

// Window width cutoff for expression show
const COLUMN_EXPRESSION_HIDE_THRESHOLD = 1500;

interface ViewConstituentsProps {
  expression: string;
  isBottom?: boolean;
  activeCst?: IConstituenta;
  schema?: IRSForm;
  onOpenEdit: (cstID: ConstituentaID) => void;
}

function ViewConstituents({ expression, schema, activeCst, isBottom, onOpenEdit }: ViewConstituentsProps) {
  const { calculateHeight } = useConceptOptions();

  const [filteredData, setFilteredData] = useState<IConstituenta[]>(schema?.items ?? []);

  const table = useMemo(
    () => (
      <ConstituentsTable
        maxHeight={isBottom ? calculateHeight('42rem') : calculateHeight('8.2rem')}
        items={filteredData}
        activeCst={activeCst}
        onOpenEdit={onOpenEdit}
        denseThreshold={COLUMN_EXPRESSION_HIDE_THRESHOLD}
      />
    ),
    [isBottom, filteredData, activeCst, onOpenEdit, calculateHeight]
  );

  return (
    <motion.div
      className={clsx(
        'border overflow-hidden', // prettier: split-lines
        {
          'mt-[2.2rem] rounded-l-md rounded-r-none': !isBottom, // prettier: split-lines
          'mt-3 mx-6 rounded-md md:w-[45.8rem]': isBottom
        }
      )}
      initial={{ ...animateSideView.initial }}
      animate={{ ...animateSideView.animate }}
      exit={{ ...animateSideView.exit }}
    >
      <ConstituentsSearch
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
