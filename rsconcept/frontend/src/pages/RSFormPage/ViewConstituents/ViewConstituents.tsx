'use client';

import clsx from 'clsx';
import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

import { useConceptTheme } from '@/context/ThemeContext';
import { ConstituentaID, IConstituenta, IRSForm } from '@/models/rsform';
import { animateSideView } from '@/styling/animations';

import ConstituentsSearch from './ConstituentsSearch';
import ConstituentsTable from './ConstituentsTable';

// Height that should be left to accommodate navigation panel + bottom margin
const LOCAL_NAVIGATION_H = '2.1rem';

// Window width cutoff for expression show
const COLUMN_EXPRESSION_HIDE_THRESHOLD = 1500;

interface ViewConstituentsProps {
  expression: string;
  isBottom?: boolean;
  baseHeight: string;
  activeID?: ConstituentaID;
  schema?: IRSForm;
  onOpenEdit: (cstID: ConstituentaID) => void;
}

function ViewConstituents({ expression, schema, activeID, isBottom, baseHeight, onOpenEdit }: ViewConstituentsProps) {
  const { noNavigation } = useConceptTheme();

  const [filteredData, setFilteredData] = useState<IConstituenta[]>(schema?.items ?? []);

  const maxHeight = useMemo(() => {
    const siblingHeight = `${baseHeight} - ${LOCAL_NAVIGATION_H}`;
    return noNavigation
      ? `calc(min(100vh - 8.2rem, ${siblingHeight}))`
      : `calc(min(100vh - 11.7rem, ${siblingHeight}))`;
  }, [noNavigation, baseHeight]);

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
        maxHeight={isBottom ? '12rem' : maxHeight}
        items={filteredData}
        activeID={activeID}
        onOpenEdit={onOpenEdit}
        denseThreshold={COLUMN_EXPRESSION_HIDE_THRESHOLD}
      />
    </motion.div>
  );
}

export default ViewConstituents;
