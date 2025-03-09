'use client';

import clsx from 'clsx';

import { EditorLibraryItem, ToolbarItemCard } from '@/features/library/components';

import { useModificationStore } from '@/stores/modification';
import { globalIDs } from '@/utils/constants';

import { useOssEdit } from '../OssEditContext';

import { FormOSS } from './FormOSS';
import { OssStats } from './OssStats';

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
      <ToolbarItemCard onSubmit={initiateSubmit} schema={schema} isMutable={isMutable} deleteSchema={deleteSchema} />
      <div
        onKeyDown={handleInput}
        className={clsx(
          'cc-fade-in',
          'md:max-w-fit max-w-128 min-w-fit',
          'flex flex-row flex-wrap pt-8 px-6 justify-center'
        )}
      >
        <div className='cc-column px-3'>
          <FormOSS />
          <EditorLibraryItem schema={schema} isAttachedToOSS={false} />
        </div>

        <OssStats stats={schema.stats} />
      </div>
    </>
  );
}
