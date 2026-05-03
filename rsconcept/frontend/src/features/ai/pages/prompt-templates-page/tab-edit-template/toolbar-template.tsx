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
    if (window.confirm(tx('labels.prompt.deleteTemplate'))) {
      void deletePromptTemplate(activeID).then(() =>
        router.pushAsync({ path: urls.prompt_template(null, PromptTabID.LIST) })
      );
    }
  }

  return (
    <div className={cn('cc-icons items-start outline-hidden', className)}>
      <MiniButton
        title={prepareTooltip(tx('semantic.action.saveChanges'), isMac() ? 'Cmd + S' : 'Ctrl + S')}
        aria-label={tx('semantic.action.saveChanges')}
        icon={<IconSave size='1.25rem' className='icon-primary' />}
        onClick={onSave}
        disabled={isProcessing || !isModified}
      />
      <MiniButton
        title={tx('semantic.action.resetChanges')}
        aria-label={tx('semantic.action.resetChanges')}
        icon={<IconReset size='1.25rem' className='icon-primary' />}
        onClick={onReset}
        disabled={isProcessing || !isModified}
      />
      <MiniButton
        title={tx('ui.ai.deleteTemplate')}
        aria-label={tx('ui.aria.deleteTemplate')}
        icon={<IconDestroy size='1.25rem' className='icon-red' />}
        onClick={handleDelete}
        disabled={isProcessing}
      />
    </div>
  );
}
