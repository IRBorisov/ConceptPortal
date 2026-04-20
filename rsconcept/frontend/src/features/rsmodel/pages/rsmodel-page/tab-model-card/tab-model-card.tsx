'use client';

import { useSyncExternalStore } from 'react';
import clsx from 'clsx';

import { calculateModelStats } from '@/domain/library/rsmodel-api';

import { ButtonSidebar } from '@/features/library/components/button-sidebar';
import { EditorLibraryItem } from '@/features/library/components/editor-library-item';

import { useWindowSize } from '@/hooks/use-window-size';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { globalIDs } from '@/utils/constants';

import { useRSModelEdit } from '../rsmodel-context';

import { FormRSModel } from './form-rsmodel';
import { ViewModelStats } from './view-model-stats';

const SIDELIST_LAYOUT_THRESHOLD = 768; // px

export function TabModelCard() {
  const { model, engine, schema } = useRSModelEdit();
  const isModified = useModificationStore(state => state.isModified);
  const windowSize = useWindowSize();
  const isNarrow = !!windowSize.width && windowSize.width <= SIDELIST_LAYOUT_THRESHOLD;
  const showStats = usePreferencesStore(state => state.showRSModelStats);
  const toggleShowStats = usePreferencesStore(state => state.toggleShowRSModelStats);

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
        <ButtonSidebar
          title='Отображение статистики'
          show={showStats}
          isNarrow={isNarrow}
          onClick={toggleShowStats}
          className='absolute top-0.5 -right-2'
        />

        <FormRSModel key={model.id} className='min-w-88 sm:w-120' />
        <EditorLibraryItem item={model} isProduced={false} />
      </div>

      <aside
        className={clsx(
          'w-80 md:w-56 md:mt-9 mx-auto',
          'cc-animate-sidebar',
          showStats ? 'max-w-full' : 'opacity-0 max-w-0'
        )}
      >
        <ViewModelStats stats={stats} />
      </aside>
    </div>
  );
}
