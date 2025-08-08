'use client';

import clsx from 'clsx';

import { EditorLibraryItem } from '@/features/library/components/editor-library-item';
import { ToolbarItemCard } from '@/features/library/components/toolbar-item-card';

import { useWindowSize } from '@/hooks/use-window-size';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { globalIDs } from '@/utils/constants';

import { OssStats } from '../../../components/oss-stats';
import { useOssEdit } from '../oss-edit-context';

import { FormOSS } from './form-oss';

const SIDELIST_LAYOUT_THRESHOLD = 768; // px

export function EditorOssCard() {
  const { schema, isMutable, deleteSchema } = useOssEdit();
  const isModified = useModificationStore(state => state.isModified);
  const showOSSStats = usePreferencesStore(state => state.showOSSStats);
  const windowSize = useWindowSize();
  const isNarrow = !!windowSize.width && windowSize.width <= SIDELIST_LAYOUT_THRESHOLD;

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
        <FormOSS key={schema.id} />
        <EditorLibraryItem schema={schema} isAttachedToOSS={false} />
      </div>

      <OssStats
        className={clsx(
          'w-80 md:w-56 mt-3 md:mt-8 mx-auto md:ml-5 md:mr-0',
          'cc-animate-sidebar',
          showOSSStats ? 'max-w-full' : 'opacity-0 max-w-0'
        )}
        stats={schema.stats}
      />
    </div>
  );
}
