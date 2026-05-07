'use client';

import { toast } from 'react-toastify';

import { useTx } from '@/i18n';

import { useConceptNavigation } from '@/app';

import { MiniButton } from '@/components/control';
import { IconClipboard, IconEdit } from '@/components/icons';
import { useDialogsStore } from '@/stores/dialogs';

interface MenuAIPromptProps {
  promptID: number;
  generatedPrompt: string;
}

export function MenuAIPrompt({ promptID, generatedPrompt }: MenuAIPromptProps) {
  const tx = useTx();
  const router = useConceptNavigation();
  const hideDialog = useDialogsStore(state => state.hideDialog);

  function navigatePrompt() {
    hideDialog();
    router.gotoPromptEdit(promptID);
  }

  function handleCopyPrompt() {
    void navigator.clipboard.writeText(generatedPrompt);
    toast.success(tx('labels.info.promptReady'));
  }

  return (
    <div className='flex border-r-2 pr-2'>
      <MiniButton
        title={tx('tx.ai.template.edit')}
        noHover
        noPadding
        icon={<IconEdit size='1.25rem' />}
        className='h-full pl-2 text-muted-foreground hover:text-primary cc-animate-color bg-transparent'
        onClick={navigatePrompt}
      />
      <MiniButton
        title={tx('tx.ai.generated.copy')}
        noHover
        noPadding
        icon={<IconClipboard size='1.25rem' />}
        className='h-full pl-2 text-muted-foreground hover:text-constructive cc-animate-color bg-transparent'
        onClick={handleCopyPrompt}
        disabled={!generatedPrompt}
      />
    </div>
  );
}
