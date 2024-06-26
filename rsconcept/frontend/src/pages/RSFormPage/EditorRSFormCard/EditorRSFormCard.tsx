'use client';

import clsx from 'clsx';

import FlexColumn from '@/components/ui/FlexColumn';
import AnimateFade from '@/components/wrap/AnimateFade';
import { useAuth } from '@/context/AuthContext';
import { useRSForm } from '@/context/RSFormContext';
import { globals } from '@/utils/constants';

import { useRSEdit } from '../RSEditContext';
import EditorLibraryItem from './EditorLibraryItem';
import FormRSForm from './FormRSForm';
import RSFormStats from './RSFormStats';
import ToolbarRSFormCard from './ToolbarRSFormCard';

interface EditorRSFormCardProps {
  isModified: boolean;
  setIsModified: React.Dispatch<React.SetStateAction<boolean>>;
  onDestroy: () => void;
}

function EditorRSFormCard({ isModified, onDestroy, setIsModified }: EditorRSFormCardProps) {
  const { schema, isSubscribed } = useRSForm();
  const { user } = useAuth();
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
        subscribed={isSubscribed}
        modified={isModified}
        anonymous={!user}
        onSubmit={initiateSubmit}
        onDestroy={onDestroy}
      />
      <AnimateFade
        onKeyDown={handleInput}
        className={clsx('sm:w-fit sm:max-w-fit max-w-[32rem]', 'mx-auto ', 'flex flex-col sm:flex-row px-6')}
      >
        <FlexColumn className='flex-shrink'>
          <FormRSForm id={globals.library_item_editor} isModified={isModified} setIsModified={setIsModified} />
          <EditorLibraryItem item={schema} isModified={isModified} controller={controller} />
        </FlexColumn>

        <RSFormStats stats={schema?.stats} />
      </AnimateFade>
    </>
  );
}

export default EditorRSFormCard;
