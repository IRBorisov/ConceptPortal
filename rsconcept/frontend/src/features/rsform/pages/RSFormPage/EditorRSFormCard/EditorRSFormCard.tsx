'use client';

import clsx from 'clsx';

import { EditorLibraryItem } from '@/features/library/components';

import { FlexColumn } from '@/components/Container';
import { useModificationStore } from '@/stores/modification';
import { globalIDs } from '@/utils/constants';

import { ToolbarRSFormCard } from '../../../components/ToolbarRSFormCard';
import { useRSEdit } from '../RSEditContext';

import { FormRSForm } from './FormRSForm';
import { RSFormStats } from './RSFormStats';

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
    <>
      <ToolbarRSFormCard onSubmit={initiateSubmit} schema={schema} isMutable={isMutable} deleteSchema={deleteSchema} />
      <div
        onKeyDown={handleInput}
        className={clsx(
          'cc-fade-in',
          'md:w-fit md:max-w-fit max-w-[32rem]',
          'flex flex-row flex-wrap px-6 pt-[1.9rem]'
        )}
      >
        <FlexColumn className='shrink'>
          <FormRSForm />
          <EditorLibraryItem schema={schema} isAttachedToOSS={isAttachedToOSS} />
        </FlexColumn>

        <RSFormStats stats={schema.stats} isArchive={isArchive} />
      </div>
    </>
  );
}
