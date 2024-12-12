'use client';

import { useLayoutEffect, useMemo } from 'react';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import { useConceptOptions } from '@/context/ConceptOptionsContext';
import { resources } from '@/utils/constants';

function DatabaseSchemaPage() {
  const { calculateHeight, setNoFooter } = useConceptOptions();

  const panelHeight = useMemo(() => calculateHeight('0px'), [calculateHeight]);

  useLayoutEffect(() => {
    setNoFooter(true);
    return () => setNoFooter(false);
  }, [setNoFooter]);

  return (
    <div className='cc-fade-in flex justify-center overflow-hidden' style={{ maxHeight: panelHeight }}>
      <TransformWrapper>
        <TransformComponent>
          <img alt='Схема базы данных' src={resources.db_schema} className='w-fit h-fit' />
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}

export default DatabaseSchemaPage;
