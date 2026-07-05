'use client';

import clsx from 'clsx';

import { type Constituenta } from '@rsconcept/domain/library';
import { isSchemaIssue } from '@rsconcept/domain/library/rsform-api';
import { isModelIssue } from '@rsconcept/domain/library/rsmodel-api';

import { useConceptNavigation } from '@/app';
import { ViewConstituents } from '@/features/rsform/components/view-constituents';
import { ConstituentsNarrowPicker } from '@/features/rsform/components/view-constituents/constituents-narrow-picker';
import { useSchemaEdit } from '@/features/rsform/pages/rsform-page/schema-edit-context';

import { useFitHeight, useMainHeight } from '@/stores/app-layout';
import { globalIDs } from '@/utils/constants';

import { useModelEdit } from '../model-edit-context';

import { FormEvaluator } from './form-evaluator';
import { ToolbarEvaluator } from './toolbar-evaluator';

export function TabEvaluator() {
  const router = useConceptNavigation();
  const { schema, activeCst } = useSchemaEdit();
  const { engine } = useModelEdit();
  const mainHeight = useMainHeight();

  const listHeight = useFitHeight('8.2rem', '10rem');

  function handleInput(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.altKey && event.code === 'KeyQ') {
      event.preventDefault();
      event.stopPropagation();
      engine.recalculateAll();
      return;
    }
  }

  function handleActivateCst(cst: Constituenta) {
    router.changeActive(cst.id);
  }

  return (
    <div
      tabIndex={-1}
      className={clsx(
        'relative ',
        'min-h-80 max-w-[calc(min(100vw,80rem))] mx-auto',
        'flex flex-col md:items-center lg:flex-row lg:items-stretch pt-8',
        'overflow-y-auto overflow-x-clip'
      )}
      style={{ maxHeight: mainHeight }}
      onKeyDown={handleInput}
    >
      <ToolbarEvaluator
        className={clsx('cc-tab-tools cc-animate-position', 'right-4 lg:right-1/2 -translate-x-1/2 lg:translate-x-0')}
      />

      <div className='mx-0 min-w-120 md:mx-auto pt-16 md:w-195 shrink-0 xs:pt-8 min-h-6'>
        <ConstituentsNarrowPicker
          searchClassName='mb-1 ml-6 -mt-6 self-start'
          schema={schema}
          engine={engine}
          activeCst={activeCst}
          isSchemaIssue={isSchemaIssue}
          isModelIssue={cst => isModelIssue(engine, cst)}
          onActivate={handleActivateCst}
          showModelFilter
          stopSearchKeyPropagation
        >
          <FormEvaluator key={`eval-${activeCst?.id ?? 0}`} id={globalIDs.evaluator} />
        </ConstituentsNarrowPicker>
      </div>

      <ViewConstituents
        className={clsx(
          'cc-animate-sidebar min-h-55 hidden lg:block',
          'mt-9 rounded-l-md rounded-r-none overflow-visible'
        )}
        schema={schema}
        engine={engine}
        activeCst={activeCst}
        isSchemaIssue={isSchemaIssue}
        isModelIssue={cst => isModelIssue(engine, cst)}
        onActivate={handleActivateCst}
        maxListHeight={listHeight}
      />
    </div>
  );
}
