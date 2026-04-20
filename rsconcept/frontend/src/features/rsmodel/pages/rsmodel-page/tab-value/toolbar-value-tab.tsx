'use client';

import { isInferrable } from '@/domain/library/rsmodel-api';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { useSchemaEdit } from '@/features/rsform/pages/rsform-page/schema-edit-context';

import { MiniButton } from '@/components/control';
import {
  IconCalculateAll,
  IconCalculateOne,
  IconClone,
  IconDestroy,
  IconNewItem,
  IconReset,
  IconSave
} from '@/components/icons';
import { cn } from '@/components/utils';
import { useModificationStore } from '@/stores/modification';
import { prepareTooltip } from '@/utils/format';
import { tooltipText } from '@/utils/labels';
import { isMac } from '@/utils/utils';

import { useModelEdit } from '../model-edit-context';

interface ToolbarValueTabProps {
  className?: string;
  onSubmit: () => void;
  onReset: () => void;
}

export function ToolbarValueTab({ className, onSubmit, onReset }: ToolbarValueTabProps) {
  const { engine } = useModelEdit();
  const {
    activeCst,
    isContentEditable,
    isProcessing,
    promptCreateCst,
    cloneCst,
    promptDeleteSelected,
    canDeleteSelected
  } = useSchemaEdit();

  const isModified = useModificationStore(state => state.isModified);

  const formDisabled = isProcessing || !activeCst || !isContentEditable;

  return (
    <div className={cn('px-1 rounded-b-2xl cc-icons outline-hidden', className)}>
      <MiniButton
        titleHtml={prepareTooltip('Сохранить изменения', isMac() ? 'Cmd + S' : 'Ctrl + S')}
        aria-label='Сохранить изменения'
        icon={<IconSave size='1.25rem' className='icon-primary' />}
        onClick={onSubmit}
        disabled={isProcessing || !activeCst || !isModified}
      />
      <MiniButton
        title='Сбросить несохраненные изменения'
        icon={<IconReset size='1.25rem' className='icon-primary' />}
        onClick={onReset}
        disabled={isProcessing || !activeCst || !isModified}
      />

      <MiniButton
        titleHtml='Пересчитать модель'
        aria-label='Пересчитать все вычисления'
        icon={<IconCalculateAll size='1.25rem' className='icon-green' />}
        onClick={() => engine.recalculateAll()}
      />
      <MiniButton
        titleHtml={prepareTooltip('Вычислить текущую конституенту', isMac() ? 'Cmd + Q' : 'Ctrl + Q')}
        aria-label='Вычислить текущую конституенту'
        icon={<IconCalculateOne size='1.25rem' className='icon-green' />}
        onClick={
          activeCst
            ? () => {
                engine.calculateCst(activeCst.id);
              }
            : undefined
        }
        disabled={isProcessing || !activeCst || isModified || !isInferrable(activeCst.cst_type)}
      />
      {isContentEditable && activeCst ? (
        <>
          <MiniButton
            title='Создать конституенту'
            icon={<IconNewItem size='1.25rem' className='icon-green' />}
            onClick={() => void promptCreateCst(activeCst.cst_type)}
            disabled={formDisabled}
          />
          <MiniButton
            titleHtml={isModified ? tooltipText.unsaved : prepareTooltip('Клонировать конституенту', 'Alt + V')}
            aria-label='Клонировать конституенту'
            icon={<IconClone size='1.25rem' className='icon-green' />}
            onClick={() => void cloneCst()}
            disabled={formDisabled || isModified}
          />
        </>
      ) : null}

      {isContentEditable && activeCst ? (
        <MiniButton
          title='Удалить конституенту'
          icon={<IconDestroy size='1.25rem' className='icon-red' />}
          onClick={promptDeleteSelected}
          disabled={formDisabled || !canDeleteSelected}
        />
      ) : null}

      <BadgeHelp topic={HelpTopic.UI_MODEL_VALUE} offset={4} contentClass='sm:max-w-160' />
    </div>
  );
}
