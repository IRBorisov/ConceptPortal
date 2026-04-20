'use client';

import clsx from 'clsx';

import { isProblematic } from '@/domain/library/rsform-api';

import { useConceptNavigation } from '@/app';
import { ViewConstituents } from '@/features/rsform/components/view-constituents';
import { useRSFormEdit } from '@/features/rsform/pages/rsform-page/rsedit-context';

import { useWindowSize } from '@/hooks/use-window-size';
import { useFitHeight, useMainHeight } from '@/stores/app-layout';
import { globalIDs } from '@/utils/constants';

import { useRSModelEdit } from '../rsmodel-context';

import { FormEvaluator } from './form-evaluator';
import { ToolbarEvaluator } from './toolbar-evaluator';

// Threshold window width to switch layout.
const SIDELIST_LAYOUT_THRESHOLD = 1000; // px

export function TabEvaluator() {
  const router = useConceptNavigation();
  const { schema, activeCst } = useRSFormEdit();
  const { engine } = useRSModelEdit();
  const windowSize = useWindowSize();
  const mainHeight = useMainHeight();

  const isNarrow = !!windowSize.width && windowSize.width <= SIDELIST_LAYOUT_THRESHOLD;
  const listHeight = useFitHeight(!isNarrow ? '8.2rem' : '42rem', '10rem');

  function handleInput(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.altKey && event.code === 'KeyQ') {
      event.preventDefault();
      event.stopPropagation();
      engine.recalculateAll();
      return;
    }
  }

  return (
    <div
      tabIndex={-1}
      className={clsx(
        'relative ',
        'min-h-80 max-w-[calc(min(100vw,80rem))] mx-auto',
        'flex pt-8',
        'overflow-y-auto overflow-x-clip',
        isNarrow && 'flex-col md:items-center'
      )}
      style={{ maxHeight: mainHeight }}
      onKeyDown={handleInput}
    >
      <ToolbarEvaluator
        className={clsx(
          'cc-tab-tools',
          'right-1/2 translate-x-0 xs:right-4 xs:-translate-x-1/2 md:right-1/2 md:translate-x-0',
          'cc-animate-position'
        )}
      />

      <FormEvaluator
        key={`eval-${activeCst?.id ?? 0}`}
        id={globalIDs.evaluator}
        className='min-w-120 md:mx-auto pt-16 md:w-195 shrink-0 xs:pt-8'
      />

      <ViewConstituents
        className={clsx(
          'cc-animate-sidebar min-h-55',
          isNarrow ? 'mt-3 mx-6 rounded-md overflow-hidden' : 'mt-9 rounded-l-md rounded-r-none overflow-visible'
        )}
        schema={schema}
        engine={engine}
        activeCst={activeCst}
        isProblematic={isProblematic}
        onActivate={cst => router.changeActive(cst.id)}
        maxListHeight={listHeight}
        autoScroll={!isNarrow}
      />
    </div>
  );
}
