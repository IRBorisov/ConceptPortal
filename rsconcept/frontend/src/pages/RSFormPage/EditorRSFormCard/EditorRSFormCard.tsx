'use client';

import clsx from 'clsx';

import FlexColumn from '@/components/ui/FlexColumn';
import { useRSForm } from '@/context/RSFormContext';
import { globals } from '@/utils/constants';

import { useRSEdit } from '../RSEditContext';
import EditorLibraryItem from './EditorLibraryItem';
import FormRSForm from './FormRSForm';
import RSFormStats from './RSFormStats';
import ToolbarRSFormCard from './ToolbarRSFormCard';

interface EditorRSFormCardProps {
  isModified: boolean;
  setIsModified: (newValue: boolean) => void;
  onDestroy: () => void;
}

function EditorRSFormCard({ isModified, onDestroy, setIsModified }: EditorRSFormCardProps) {
  const model = useRSForm();
  const controller = useRSEdit();

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
      <ToolbarRSFormCard
        modified={isModified}
        onSubmit={initiateSubmit}
        onDestroy={onDestroy}
        controller={controller}
      />
      <div
        onKeyDown={handleInput}
        className={clsx(
          'cc-fade-in',
          'md:w-fit md:max-w-fit max-w-[32rem] mx-auto',
          'flex flex-row flex-wrap px-6 pt-[1.9rem]'
        )}
      >
        <FlexColumn className='flex-shrink'>
          <FormRSForm id={globals.library_item_editor} isModified={isModified} setIsModified={setIsModified} />
          <EditorLibraryItem item={model.schema} isModified={isModified} controller={controller} />
        </FlexColumn>

        {model.schema ? <RSFormStats stats={model.schema.stats} isArchive={model.isArchive} /> : null}
      </div>
    </>
  );
}

export default EditorRSFormCard;
