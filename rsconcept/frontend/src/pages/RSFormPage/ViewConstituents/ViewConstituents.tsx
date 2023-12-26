'use client';

import { motion } from 'framer-motion';
import { useMemo, useState } from 'react';

import { useConceptTheme } from '@/context/ThemeContext';
import { IConstituenta, IRSForm } from '@/models/rsform';
import { animateSideView } from '@/utils/animations';

import ConstituentsSearch from './ConstituentsSearch';
import ConstituentsTable from './ConstituentsTable';

// Height that should be left to accommodate navigation panel + bottom margin
const LOCAL_NAVIGATION_H = '2.1rem';

// Window width cutoff for expression show
const COLUMN_EXPRESSION_HIDE_THRESHOLD = 1500;

interface ViewConstituentsProps {
  expression: string
  baseHeight: string
  activeID?: number
  schema?: IRSForm
  onOpenEdit: (cstID: number) => void
}

function ViewConstituents({ expression, baseHeight, schema, activeID, onOpenEdit }: ViewConstituentsProps) {
  const { noNavigation } = useConceptTheme();
  
  const [filteredData, setFilteredData] = useState<IConstituenta[]>(schema?.items ?? []);

  const maxHeight = useMemo(
  () => {
    const siblingHeight = `${baseHeight} - ${LOCAL_NAVIGATION_H}`
    return (noNavigation ? 
      `calc(min(100vh - 8.2rem, ${siblingHeight}))`
    : `calc(min(100vh - 11.7rem, ${siblingHeight}))`);
  }, [noNavigation, baseHeight]);

  return (
  <motion.div
    className='mt-[2.25rem] border'
    initial={{...animateSideView.initial}}
    animate={{...animateSideView.animate}}
    exit={{...animateSideView.exit}}
  >
    <ConstituentsSearch 
      schema={schema}
      activeID={activeID}
      activeExpression={expression}
      setFiltered={setFilteredData}
    />
    <ConstituentsTable maxHeight={maxHeight}
      items={filteredData}
      activeID={activeID}
      onOpenEdit={onOpenEdit}
      denseThreshold={COLUMN_EXPRESSION_HIDE_THRESHOLD}
    />
  </motion.div>);
}

export default ViewConstituents;