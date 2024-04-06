'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useState } from 'react';

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
  activeID?: ConstituentaID;
  schema?: IRSForm;
  onOpenEdit: (cstID: ConstituentaID) => void;
}

function ViewConstituents({ expression, schema, activeID, isBottom, onOpenEdit }: ViewConstituentsProps) {
  const { calculateHeight } = useConceptOptions();

  const [filteredData, setFilteredData] = useState<IConstituenta[]>(schema?.items ?? []);

  return (
    <motion.div
      className={clsx(
        'border', // prettier: split-lines
        {
          'mt-[2.25rem]': !isBottom, // prettier: split-lines
          'mt-3 mx-6': isBottom
        }
      )}
      initial={{ ...animateSideView.initial }}
      animate={{ ...animateSideView.animate }}
      exit={{ ...animateSideView.exit }}
    >
      <ConstituentsSearch
        schema={schema}
        activeID={activeID}
        activeExpression={expression}
        setFiltered={setFilteredData}
      />
      <ConstituentsTable
        maxHeight={isBottom ? '12rem' : calculateHeight('8.2rem')}
        items={filteredData}
        activeID={activeID}
        onOpenEdit={onOpenEdit}
        denseThreshold={COLUMN_EXPRESSION_HIDE_THRESHOLD}
      />
    </motion.div>
  );
}

export default ViewConstituents;
