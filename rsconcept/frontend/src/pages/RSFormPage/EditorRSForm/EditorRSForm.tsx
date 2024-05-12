'use client';

import clsx from 'clsx';

import InfoLibraryItem from '@/components/info/InfoLibraryItem';
import Divider from '@/components/ui/Divider';
import FlexColumn from '@/components/ui/FlexColumn';
import AnimateFade from '@/components/wrap/AnimateFade';
import { useAuth } from '@/context/AuthContext';
import { useRSForm } from '@/context/RSFormContext';
import { globals } from '@/utils/constants';

import FormRSForm from './FormRSForm';
import RSFormStats from './RSFormStats';
import RSFormToolbar from './RSFormToolbar';

interface EditorRSFormProps {
  isModified: boolean;
  setIsModified: React.Dispatch<React.SetStateAction<boolean>>;
  onDestroy: () => void;
}

function EditorRSForm({ isModified, onDestroy, setIsModified }: EditorRSFormProps) {
  const { schema, isClaimable, isSubscribed } = useRSForm();
  const { user } = useAuth();

  function initiateSubmit() {
    const element = document.getElementById(globals.library_item_editor) as HTMLFormElement;
    if (element) {
      element.requestSubmit();
    }
  }

  function handleInput(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.ctrlKey && event.code === 'KeyS') {
      if (isModified) {
        initiateSubmit();
      }
      event.preventDefault();
    }
  }

  return (
    <>
      <RSFormToolbar
        subscribed={isSubscribed}
        modified={isModified}
        claimable={isClaimable}
        anonymous={!user}
        onSubmit={initiateSubmit}
        onDestroy={onDestroy}
      />
      <AnimateFade onKeyDown={handleInput} className={clsx('sm:w-fit w-full', 'flex flex-col sm:flex-row')}>
        <FlexColumn className='px-4 pb-2'>
          <FormRSForm id={globals.library_item_editor} isModified={isModified} setIsModified={setIsModified} />

          <Divider margins='my-1' />

          <InfoLibraryItem item={schema} />
        </FlexColumn>

        <RSFormStats stats={schema?.stats} />
      </AnimateFade>
    </>
  );
}

export default EditorRSForm;
