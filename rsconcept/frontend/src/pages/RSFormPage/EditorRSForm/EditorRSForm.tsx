'use client';

import InfoLibraryItem from '@/components/InfoLibraryItem';
import Divider from '@/components/ui/Divider';
import FlexColumn from '@/components/ui/FlexColumn';
import { useAuth } from '@/context/AuthContext';
import { useRSForm } from '@/context/RSFormContext';
import { globalIDs } from '@/utils/constants';

import { useRSEdit } from '../RSEditContext';
import FormRSForm from './FormRSForm';
import RSFormStats from './RSFormStats';
import RSFormToolbar from './RSFormToolbar';

interface EditorRSFormProps {
  isModified: boolean;
  setIsModified: React.Dispatch<React.SetStateAction<boolean>>;
  onDestroy: () => void;
}

function EditorRSForm({ isModified, onDestroy, setIsModified }: EditorRSFormProps) {
  const { isMutable } = useRSEdit();
  const { schema, isClaimable, isSubscribed, processing } = useRSForm();
  const { user } = useAuth();

  function initiateSubmit() {
    const element = document.getElementById(globalIDs.library_item_editor) as HTMLFormElement;
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
        processing={processing}
        subscribed={isSubscribed}
        modified={isModified}
        claimable={isClaimable}
        anonymous={!user}
        onSubmit={initiateSubmit}
        onDestroy={onDestroy}
      />
      <div tabIndex={-1} className='flex flex-col sm:flex-row w-fit' onKeyDown={handleInput}>
        <FlexColumn className='px-4 pb-2'>
          <FormRSForm
            disabled={!isMutable}
            id={globalIDs.library_item_editor}
            isModified={isModified}
            setIsModified={setIsModified}
          />

          <Divider margins='my-1' />

          <InfoLibraryItem item={schema} />
        </FlexColumn>

        <RSFormStats stats={schema?.stats} />
      </div>
    </>
  );
}

export default EditorRSForm;
