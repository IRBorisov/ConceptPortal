'use client';

import { toast } from 'react-toastify';

import { useConceptNavigation } from '@/app';

import { MiniButton } from '@/components/control';
import { IconClone, IconEdit } from '@/components/icons';
import { useDialogsStore } from '@/stores/dialogs';
import { infoMsg } from '@/utils/labels';

interface MenuAIPromptProps {
  promptID: number;
  generatedPrompt: string;
}

export function MenuAIPrompt({ promptID, generatedPrompt }: MenuAIPromptProps) {
  const router = useConceptNavigation();
  const hideDialog = useDialogsStore(state => state.hideDialog);

  function navigatePrompt() {
    hideDialog();
    router.gotoPromptEdit(promptID);
  }

  function handleCopyPrompt() {
    void navigator.clipboard.writeText(generatedPrompt);
    toast.success(infoMsg.promptReady);
  }

  return (
    <div className='flex border-r-2 pr-2'>
      <MiniButton
        title='Редактировать шаблон'
        noHover
        noPadding
        icon={<IconEdit size='1.25rem' />}
        className='h-full pl-2 text-muted-foreground hover:text-primary cc-animate-color bg-transparent'
        onClick={navigatePrompt}
      />
      <MiniButton
        title='Скопировать результат в буфер обмена'
        noHover
        noPadding
        icon={<IconClone size='1.25rem' />}
        className='h-full pl-2 text-muted-foreground hover:text-constructive cc-animate-color bg-transparent'
        onClick={handleCopyPrompt}
        disabled={!generatedPrompt}
      />
    </div>
  );
}
