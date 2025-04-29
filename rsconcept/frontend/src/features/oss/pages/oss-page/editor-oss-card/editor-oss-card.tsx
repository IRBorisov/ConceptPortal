'use client';

import clsx from 'clsx';

import { EditorLibraryItem, ToolbarItemCard } from '@/features/library/components';

import { useModificationStore } from '@/stores/modification';
import { globalIDs } from '@/utils/constants';

import { useOssEdit } from '../oss-edit-context';

import { FormOSS } from './form-oss';
import { OssStats } from './oss-stats';

export function EditorOssCard() {
  const { schema, isMutable, deleteSchema } = useOssEdit();
  const { isModified } = useModificationStore();

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
    <>
      <ToolbarItemCard
        className='cc-tab-tools'
        onSubmit={initiateSubmit}
        schema={schema}
        isMutable={isMutable}
        deleteSchema={deleteSchema}
      />
      <div
        onKeyDown={handleInput}
        className={clsx('md:max-w-fit max-w-128 min-w-fit', 'flex flex-row flex-wrap pt-8 px-6 justify-center')}
      >
        <div className='cc-column px-3'>
          <FormOSS key={schema.id} />
          <EditorLibraryItem schema={schema} isAttachedToOSS={false} />
        </div>

        <OssStats className='mt-3 md:mt-8 md:ml-5 w-80 md:w-56 mx-auto h-min' stats={schema.stats} />
      </div>
    </>
  );
}
