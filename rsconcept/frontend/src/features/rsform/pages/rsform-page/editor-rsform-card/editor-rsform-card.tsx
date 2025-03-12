'use client';

import clsx from 'clsx';

import { EditorLibraryItem, ToolbarItemCard } from '@/features/library/components';

import { useModificationStore } from '@/stores/modification';
import { globalIDs } from '@/utils/constants';

import { useRSEdit } from '../rsedit-context';

import { FormRSForm } from './form-rsform';
import { RSFormStats } from './rsform-stats';

export function EditorRSFormCard() {
  const { schema, isArchive, isMutable, deleteSchema, isAttachedToOSS } = useRSEdit();
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
    <div
      onKeyDown={handleInput}
      className={clsx(
        'relative', //
        'cc-fade-in',
        'md:w-fit md:max-w-fit max-w-128',
        'flex flex-row flex-wrap px-6 pt-8'
      )}
    >
      <ToolbarItemCard
        className='cc-tab-tools'
        onSubmit={initiateSubmit}
        schema={schema}
        isMutable={isMutable}
        deleteSchema={deleteSchema}
      />

      <div className='cc-column shrink'>
        <FormRSForm />
        <EditorLibraryItem schema={schema} isAttachedToOSS={isAttachedToOSS} />
      </div>

      <RSFormStats
        className='mt-3 md:mt-8 md:ml-5 w-80 md:w-56 mx-auto h-min'
        stats={schema.stats}
        isArchive={isArchive}
      />
    </div>
  );
}
