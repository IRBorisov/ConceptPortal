'use client';

import clsx from 'clsx';

import { urls, useConceptNavigation } from '@/app';
import { useLibrarySearchStore } from '@/features/library';
import { useDeleteItem } from '@/features/library/backend/use-delete-item';
import { EditorLibraryItem } from '@/features/library/components/editor-library-item';
import { ToolbarItemCard } from '@/features/library/components/toolbar-item-card';

import { useWindowSize } from '@/hooks/use-window-size';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { globalIDs } from '@/utils/constants';
import { promptText } from '@/utils/labels';

import { calculateModelStats } from '../../../models/rsmodel-api';
import { useRSModelEdit } from '../rsmodel-context';

import { FormRSModel } from './form-rsmodel';
import { CardRSModelStats } from './rsmodel-stats';

const SIDELIST_LAYOUT_THRESHOLD = 768; // px

export function EditorModelCard() {
  const router = useConceptNavigation();
  const { model, isMutable } = useRSModelEdit();
  const isModified = useModificationStore(state => state.isModified);
  const windowSize = useWindowSize();
  const isNarrow = !!windowSize.width && windowSize.width <= SIDELIST_LAYOUT_THRESHOLD;
  const showStats = usePreferencesStore(state => state.showRSModelStats);
  const stats = calculateModelStats(model);

  const setSearchLocation = useLibrarySearchStore(state => state.setLocation);
  const searchLocation = useLibrarySearchStore(state => state.location);

  const { deleteItem } = useDeleteItem();

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

  function handleDelete() {
    if (!window.confirm(promptText.deleteLibraryItem)) {
      return;
    }
    void deleteItem({
      target: model.id,
      beforeInvalidate: () => {
        if (searchLocation === model.location) {
          setSearchLocation('');
        }
        return router.pushAsync({ path: urls.library, force: true });
      }
    });
  }

  return (
    <div
      onKeyDown={handleInput}
      className={clsx(
        'relative md:w-fit md:max-w-fit max-w-136',
        'flex px-6 pt-8',
        isNarrow && 'flex-col md:items-center'
      )}
    >
      <ToolbarItemCard
        className='cc-tab-tools'
        onSubmit={initiateSubmit}
        item={model}
        isMutable={isMutable}
        deleteItem={handleDelete}
        isNarrow={isNarrow}
      />

      <div className='cc-column mx-0 md:mx-auto'>
        <FormRSModel key={model.id} />
        <EditorLibraryItem item={model} isAttachedToOSS={false} />
      </div>

      <aside
        className={clsx(
          'w-80 md:w-56 mt-3 md:mt-8 mx-auto md:ml-5 md:mr-0',
          'cc-animate-sidebar',
          showStats ? 'max-w-full' : 'opacity-0 max-w-0'
        )}
      >
        <CardRSModelStats stats={stats} />
      </aside>
    </div>
  );
}
