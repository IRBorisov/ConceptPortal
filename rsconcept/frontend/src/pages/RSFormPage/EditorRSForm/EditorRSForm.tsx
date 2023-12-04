import { Dispatch, SetStateAction } from 'react';

import Divider from '../../../components/Common/Divider';
import InfoLibraryItem from '../../../components/Shared/InfoLibraryItem';
import { useAuth } from '../../../context/AuthContext';
import { useRSForm } from '../../../context/RSFormContext';
import { globalIDs } from '../../../utils/constants';
import FormRSForm from './FormRSForm';
import RSFormStats from './RSFormStats';
import RSFormToolbar from './RSFormToolbar';

interface EditorRSFormProps {
  onDestroy: () => void
  onClaim: () => void
  onShare: () => void
  onDownload: () => void
  isModified: boolean
  setIsModified: Dispatch<SetStateAction<boolean>>
}

function EditorRSForm({ onDestroy, onClaim, onShare, isModified, setIsModified, onDownload }: EditorRSFormProps) {
  const { schema, isMutable, isClaimable } = useRSForm();
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
  <div tabIndex={-1} onKeyDown={handleInput}>
    <RSFormToolbar 
      isMutable={isMutable}
      modified={isModified}
      claimable={isClaimable}
      anonymous={!user}
    
      onSubmit={initiateSubmit}
      onShare={onShare}
      onDownload={onDownload}
      onClaim={onClaim}
      onDestroy={onDestroy}
    />
    <div className='flex w-full'>
      <div className='flex-grow max-w-[40rem] min-w-[30rem] px-4 pb-2'>
        <div className='flex flex-col gap-3'>
          <FormRSForm id={globalIDs.library_item_editor}
            isModified={isModified}
            setIsModified={setIsModified}
          />

          <Divider margins='my-2' />
          
          <InfoLibraryItem item={schema} />
        </div>
      </div>

      <Divider vertical />
      
      <RSFormStats stats={schema?.stats}/>
    </div>
  </div>);
}

export default EditorRSForm;
