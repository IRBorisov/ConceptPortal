'use client';

import clsx from 'clsx';

import { calculateSchemaStats } from '@/domain/library/rsform-api';

import { ButtonSidebar } from '@/features/library/components/button-sidebar';
import { EditorLibraryItem } from '@/features/library/components/editor-library-item';

import { useWindowSize } from '@/hooks/use-window-size';
import { useFitHeight } from '@/stores/app-layout';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { globalIDs } from '@/utils/constants';

import { useRSFormEdit } from '../rsedit-context';

import { FormRSForm } from './form-rsform';
import { ViewSchemaStats } from './view-schema-stats';

const SIDELIST_LAYOUT_THRESHOLD = 768; // px

export function TabRSFormCard() {
  const { schema } = useRSFormEdit();
  const isModified = useModificationStore(state => state.isModified);
  const showRSFormStats = usePreferencesStore(state => state.showRSFormStats);
  const toggleShowRSFormStats = usePreferencesStore(state => state.toggleShowRSFormStats);
  const windowSize = useWindowSize();
  const isNarrow = !!windowSize.width && windowSize.width <= SIDELIST_LAYOUT_THRESHOLD;
  const stats = calculateSchemaStats(schema);

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

  const sideBarHeight = useFitHeight('5rem');

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
          show={showRSFormStats}
          isNarrow={isNarrow}
          onClick={toggleShowRSFormStats}
          className='absolute top-0.5 -right-2'
        />

        <FormRSForm key={schema.id} className='min-w-88 sm:w-120' />
        <EditorLibraryItem item={schema} isProduced={schema.is_produced} />
      </div>

      <aside
        className={clsx(
          'w-80 md:w-56 md:mt-9 mx-auto overflow-y-auto',
          'cc-animate-sidebar',
          showRSFormStats ? 'max-w-full' : 'opacity-0 max-w-0'
        )}
        style={{ maxHeight: sideBarHeight }}
      >
        <ViewSchemaStats stats={stats} className='h-min' />
      </aside>
    </div>
  );
}
