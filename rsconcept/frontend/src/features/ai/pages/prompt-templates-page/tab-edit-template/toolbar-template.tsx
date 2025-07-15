import { urls, useConceptNavigation } from '@/app';
import { useDeletePromptTemplate } from '@/features/ai/backend/use-delete-prompt-template';
import { useMutatingPrompts } from '@/features/ai/backend/use-mutating-prompts';

import { MiniButton } from '@/components/control';
import { IconDestroy, IconReset, IconSave } from '@/components/icons';
import { cn } from '@/components/utils';
import { useModificationStore } from '@/stores/modification';
import { promptText } from '@/utils/labels';
import { isMac, prepareTooltip } from '@/utils/utils';

import { PromptTabID } from '../templates-tabs';

interface ToolbarTemplateProps {
  activeID: number;
  onSave: () => void;
  onReset: () => void;
  className?: string;
}

/** Toolbar for prompt template editing. */
export function ToolbarTemplate({ activeID, onSave, onReset, className }: ToolbarTemplateProps) {
  const router = useConceptNavigation();
  const { deletePromptTemplate } = useDeletePromptTemplate();
  const isProcessing = useMutatingPrompts();
  const isModified = useModificationStore(state => state.isModified);

  function handleDelete() {
    if (window.confirm(promptText.deleteTemplate)) {
      void deletePromptTemplate(activeID).then(() =>
        router.pushAsync({ path: urls.prompt_template(null, PromptTabID.LIST) })
      );
    }
  }

  return (
    <div className={cn('cc-icons items-start outline-hidden', className)}>
      <MiniButton
        titleHtml={prepareTooltip('Сохранить изменения', isMac() ? 'Cmd + S' : 'Ctrl + S')}
        aria-label='Сохранить изменения'
        icon={<IconSave size='1.25rem' className='icon-primary' />}
        onClick={onSave}
        disabled={isProcessing || !isModified}
      />
      <MiniButton
        title='Сбросить изменения'
        aria-label='Сбросить изменения'
        icon={<IconReset size='1.25rem' className='icon-primary' />}
        onClick={onReset}
        disabled={isProcessing || !isModified}
      />
      <MiniButton
        title='Удалить шаблон'
        aria-label='Удалить шаблон'
        icon={<IconDestroy size='1.25rem' className='icon-red' />}
        onClick={handleDelete}
        disabled={isProcessing}
      />
    </div>
  );
}
