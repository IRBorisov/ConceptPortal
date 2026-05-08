'use client';

import { useTx } from '@/i18n';

import { urls, useConceptNavigation } from '@/app';
import { PromptTabID } from '@/app/navigation/navigation-context';
import { useDeletePromptTemplate } from '@/features/ai/backend/use-delete-prompt-template';
import { useMutatingPrompts } from '@/features/ai/backend/use-mutating-prompts';

import { MiniButton } from '@/components/control';
import { IconDestroy, IconReset, IconSave } from '@/components/icons';
import { cn } from '@/components/utils';
import { useModificationStore } from '@/stores/modification';
import { prepareTooltip } from '@/utils/format';
import { isMac } from '@/utils/utils';

interface ToolbarTemplateProps {
  activeID: number;
  onSave: () => void;
  onReset: () => void;
  className?: string;
}

/** Toolbar for prompt template editing. */
export function ToolbarTemplate({ activeID, onSave, onReset, className }: ToolbarTemplateProps) {
  const tx = useTx();
  const router = useConceptNavigation();
  const { deletePromptTemplate } = useDeletePromptTemplate();
  const isProcessing = useMutatingPrompts();
  const isModified = useModificationStore(state => state.isModified);

  function handleDelete() {
    if (window.confirm(tx('tx.general.delete.confirm'))) {
      void deletePromptTemplate(activeID).then(() =>
        router.pushAsync({ path: urls.prompt_template(null, PromptTabID.LIST) })
      );
    }
  }

  return (
    <div className={cn('cc-icons items-start outline-hidden', className)}>
      <MiniButton
        title={prepareTooltip(tx('tx.general.changes.save'), isMac() ? 'Cmd + S' : 'Ctrl + S')}
        aria-label={tx('tx.general.changes.save')}
        icon={<IconSave size='1.25rem' className='icon-primary' />}
        onClick={onSave}
        disabled={isProcessing || !isModified}
      />
      <MiniButton
        title={tx('tx.general.changes.reset')}
        aria-label={tx('tx.general.changes.reset')}
        icon={<IconReset size='1.25rem' className='icon-primary' />}
        onClick={onReset}
        disabled={isProcessing || !isModified}
      />
      <MiniButton
        title={tx('tx.ai.template.delete')}
        aria-label={tx('tx.ai.template.delete')}
        icon={<IconDestroy size='1.25rem' className='icon-red' />}
        onClick={handleDelete}
        disabled={isProcessing}
      />
    </div>
  );
}
