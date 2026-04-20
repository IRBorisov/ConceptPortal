'use client';

import { useSyncExternalStore } from 'react';
import clsx from 'clsx';

import { calculateModelStats } from '@/domain/library/rsmodel-api';

import { useRSModelEdit } from '@/features/rsmodel/pages/rsmodel-page/rsmodel-context';
import { ViewModelStats } from '@/features/rsmodel/pages/rsmodel-page/tab-model-card/view-model-stats';

import { useWindowSize } from '@/hooks/use-window-size';
import { useFitHeight } from '@/stores/app-layout';
import { useModificationStore } from '@/stores/modification';
import { globalIDs } from '@/utils/constants';

import { FormSandboxItem } from './form-sandbox-item';

const SIDELIST_LAYOUT_THRESHOLD = 768;

export function TabItemCard() {
  const { engine, schema } = useRSModelEdit();
  const isModified = useModificationStore(state => state.isModified);
  const windowSize = useWindowSize();
  const isNarrow = !!windowSize.width && windowSize.width <= SIDELIST_LAYOUT_THRESHOLD;
  const engineGeneration = useSyncExternalStore(
    onStoreChange => engine.subscribeChanges(onStoreChange),
    () => engine.getChangeGeneration()
  );
  const stats = calculateModelStats(schema, engine, engineGeneration);

  function initiateSubmit() {
    const element = document.getElementById(globalIDs.library_item_editor) as HTMLFormElement;
    if (element) {
      element.requestSubmit();
    }
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if ((event.ctrlKey || event.metaKey) && event.code === 'KeyS') {
      if (isModified) {
        initiateSubmit();
      }
      event.preventDefault();
    }
  }

  const sideBarHeight = useFitHeight('5.2rem');

  return (
    <div
      tabIndex={-1}
      onKeyDown={handleKeyDown}
      className={clsx(
        'relative md:w-fit md:max-w-fit max-w-136',
        'flex px-6 pt-8',
        isNarrow ? 'flex-col gap-3 md:items-center' : 'gap-6'
      )}
    >
      <FormSandboxItem key={schema.id} className='min-w-88 sm:w-120 mx-0 md:mx-auto' />

      <ViewModelStats
        stats={stats}
        className='w-80 md:w-56 md:mt-9 mx-auto max-w-full'
        style={{ maxHeight: sideBarHeight }}
      />
    </div>
  );
}
