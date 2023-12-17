'use client';

import { Dispatch, SetStateAction } from 'react';

import Divider from '@/components/Common/Divider';
import InfoLibraryItem from '@/components/Shared/InfoLibraryItem';
import { useAuth } from '@/context/AuthContext';
import { useRSForm } from '@/context/RSFormContext';
import { globalIDs } from '@/utils/constants';

import FormRSForm from './FormRSForm';
import RSFormStats from './RSFormStats';
import RSFormToolbar from './RSFormToolbar';

interface EditorRSFormProps {
  isModified: boolean
  isMutable: boolean
  
  setIsModified: Dispatch<SetStateAction<boolean>>
  onDestroy: () => void
  onClaim: () => void
  onShare: () => void
  onDownload: () => void
  onToggleSubscribe: () => void
}

function EditorRSForm({
  isModified, isMutable,
  onDestroy, onClaim, onShare, setIsModified,
  onDownload, onToggleSubscribe
}: EditorRSFormProps) {
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
      isMutable={isMutable}
      processing={processing}
      isSubscribed={isSubscribed}
      modified={isModified}
      claimable={isClaimable}
      anonymous={!user}
    
      onSubmit={initiateSubmit}
      onShare={onShare}
      onDownload={onDownload}
      onClaim={onClaim}
      onDestroy={onDestroy}
      onToggleSubscribe={onToggleSubscribe}
    />
    <div tabIndex={-1}
      className='flex'
      onKeyDown={handleInput}
    >
      <div className='flex flex-col gap-3 px-4 pb-2'>
        <FormRSForm disabled={!isMutable}
          id={globalIDs.library_item_editor}
          isModified={isModified}
          setIsModified={setIsModified}
        />

        <Divider margins='my-2' />
        
        <InfoLibraryItem item={schema} />
      </div>

      <RSFormStats stats={schema?.stats}/>
    </div>
  </>);
}

export default EditorRSForm;