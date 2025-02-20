'use client';

import clsx from 'clsx';

import { EditorLibraryItem } from '@/features/library';
import { ToolbarRSFormCard } from '@/features/rsform';

import { FlexColumn } from '@/components/Container';
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
      <ToolbarRSFormCard onSubmit={initiateSubmit} schema={schema} isMutable={isMutable} deleteSchema={deleteSchema} />
      <div
        onKeyDown={handleInput}
        className={clsx(
          'cc-fade-in',
          'md:max-w-fit max-w-[32rem] min-w-fit',
          'pt-[1.9rem]',
          'flex flex-row flex-wrap px-6 justify-center'
        )}
      >
        <FlexColumn className='px-3'>
          <FormOSS />
          <EditorLibraryItem schema={schema} isAttachedToOSS={false} />
        </FlexColumn>

        <OssStats stats={schema.stats} />
      </div>
    </>
  );
}
