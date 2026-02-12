'use client';

import clsx from 'clsx';

import { EditorLibraryItem } from '@/features/library/components/editor-library-item';
import { ToolbarItemCard } from '@/features/library/components/toolbar-item-card';
import { calculateStats } from '@/features/rsform/models/rsform-api';

import { useWindowSize } from '@/hooks/use-window-size';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { globalIDs } from '@/utils/constants';

import { CardRSFormStats } from '../../../components/rsform-stats';
import { useRSEdit } from '../rsedit-context';

import { FormRSForm } from './form-rsform';

const SIDELIST_LAYOUT_THRESHOLD = 768; // px

export function EditorRSFormCard() {
  const { schema, isMutable, deleteSchema, isAttachedToOSS } = useRSEdit();
  const isModified = useModificationStore(state => state.isModified);
  const showRSFormStats = usePreferencesStore(state => state.showRSFormStats);
  const windowSize = useWindowSize();
  const isNarrow = !!windowSize.width && windowSize.width <= SIDELIST_LAYOUT_THRESHOLD;
  const stats = calculateStats(schema);

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
        isNarrow && 'flex-col md:items-center'
      )}
    >
      <ToolbarItemCard
        className='cc-tab-tools'
        onSubmit={initiateSubmit}
        schema={schema}
        isMutable={isMutable}
        deleteSchema={deleteSchema}
        isNarrow={isNarrow}
      />

      <div className='cc-column mx-0 md:mx-auto'>
        <FormRSForm key={schema.id} />
        <EditorLibraryItem schema={schema} isAttachedToOSS={isAttachedToOSS} />
      </div>

      <aside
        className={clsx(
          'w-80 md:w-56 mt-3 md:mt-8 mx-auto md:ml-5 md:mr-0',
          'cc-animate-sidebar',
          showRSFormStats ? 'max-w-full' : 'opacity-0 max-w-0'
        )}
      >
        <CardRSFormStats stats={stats} />
      </aside>
    </div>
  );
}
