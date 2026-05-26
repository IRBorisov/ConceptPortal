'use client';

import { useSyncExternalStore } from 'react';
import clsx from 'clsx';

import { calculateModelStats } from '@rsconcept/domain/library/rsmodel-api';

import { EditorLibraryItem } from '@/features/library/components/editor-library-item';

import { useWindowSize } from '@/hooks/use-window-size';
import { useFitHeight } from '@/stores/app-layout';
import { useModificationStore } from '@/stores/modification';
import { globalIDs } from '@/utils/constants';

import { useModelEdit } from '../model-edit-context';

import { FormRSModel } from './form-rsmodel';
import { ViewModelStats } from './view-model-stats';

const SIDELIST_LAYOUT_THRESHOLD = 768; // px

export function TabModelCard() {
  const { model, engine, schema } = useModelEdit();
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

  function handleInput(event: React.KeyboardEvent<HTMLDivElement>) {
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
      onKeyDown={handleInput}
      className={clsx(
        'relative md:w-fit md:max-w-fit max-w-136',
        'flex px-6 pt-8',
        isNarrow ? 'flex-col gap-3 md:items-center' : 'gap-6'
      )}
    >
      <div className='relative cc-column mx-0 md:mx-auto'>
        <FormRSModel key={model.id} className='min-w-88 sm:w-120' />
        <EditorLibraryItem item={model} isProduced={false} />
      </div>

      <ViewModelStats
        stats={stats}
        className='w-80 md:w-56 md:mt-9 mx-auto max-w-full'
        style={{ maxHeight: sideBarHeight }}
      />
    </div>
  );
}
