'use client';

import clsx from 'clsx';

import { EditorLibraryItem } from '@/features/library/components/editor-library-item';

import { useWindowSize } from '@/hooks/use-window-size';
import { useFitHeight } from '@/stores/app-layout';
import { useModificationStore } from '@/stores/modification';
import { globalIDs } from '@/utils/constants';

import { useOssEdit } from '../oss-edit-context';

import { FormOSS } from './form-oss';
import { ViewOssStats } from './view-oss-stats';

const SIDELIST_LAYOUT_THRESHOLD = 768; // px

export function TabOssCard() {
  const { schema } = useOssEdit();
  const isModified = useModificationStore(state => state.isModified);
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
        <FormOSS key={schema.id} className='min-w-88 sm:w-120' />
        <EditorLibraryItem item={schema} isProduced={false} />
      </div>

      <ViewOssStats
        className='w-80 md:w-56 md:mt-9 mx-auto max-w-full'
        style={{ maxHeight: sideBarHeight }}
        stats={schema.stats}
      />
    </div>
  );
}
