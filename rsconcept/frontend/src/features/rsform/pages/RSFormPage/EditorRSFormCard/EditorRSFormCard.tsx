'use client';

import clsx from 'clsx';

import { FlexColumn } from '@/components/Container';
import { EditorLibraryItem } from '@/features/library/components/EditorLibraryItem';
import { useModificationStore } from '@/stores/modification';
import { globals } from '@/utils/constants';

import { useRSEdit } from '../RSEditContext';
import FormRSForm from './FormRSForm';
import RSFormStats from './RSFormStats';
import ToolbarRSFormCard from './ToolbarRSFormCard';

function EditorRSFormCard() {
  const controller = useRSEdit();
  const { isModified } = useModificationStore();

  function initiateSubmit() {
    const element = document.getElementById(globals.library_item_editor) as HTMLFormElement;
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
      <ToolbarRSFormCard onSubmit={initiateSubmit} controller={controller} />
      <div
        onKeyDown={handleInput}
        className={clsx(
          'cc-fade-in',
          'md:w-fit md:max-w-fit max-w-[32rem] mx-auto',
          'flex flex-row flex-wrap px-6 pt-[1.9rem]'
        )}
      >
        <FlexColumn className='flex-shrink'>
          <FormRSForm />
          <EditorLibraryItem controller={controller} />
        </FlexColumn>

        <RSFormStats stats={controller.schema.stats} isArchive={controller.isArchive} />
      </div>
    </>
  );
}

export default EditorRSFormCard;
