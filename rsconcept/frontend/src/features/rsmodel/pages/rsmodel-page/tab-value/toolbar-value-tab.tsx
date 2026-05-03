'use client';

import { isInferrable } from '@/domain/library/rsmodel-api';
import { useTx } from '@/i18n';

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
import { isMac } from '@/utils/utils';

import { useModelEdit } from '../model-edit-context';

interface ToolbarValueTabProps {
  className?: string;
  onSubmit: () => void;
  onReset: () => void;
}

export function ToolbarValueTab({ className, onSubmit, onReset }: ToolbarValueTabProps) {
  const tx = useTx();
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
        title={prepareTooltip(tx('semantic.action.saveChanges'), isMac() ? 'Cmd + S' : 'Ctrl + S')}
        aria-label={tx('semantic.action.saveChanges')}
        icon={<IconSave size='1.25rem' className='icon-primary' />}
        onClick={onSubmit}
        disabled={isProcessing || !activeCst || !isModified}
      />
      <MiniButton
        title={tx('ui.hint.resetUnsavedConstituenta')}
        icon={<IconReset size='1.25rem' className='icon-primary' />}
        onClick={onReset}
        disabled={isProcessing || !activeCst || !isModified}
      />

      <MiniButton
        title={tx('ui.action.recalculateModel')}
        aria-label={tx('ui.aria.recalculateAll')}
        icon={<IconCalculateAll size='1.25rem' className='icon-green' />}
        onClick={() => engine.recalculateAll()}
      />
      <MiniButton
        title={prepareTooltip(tx('ui.rsmodel.calculateCurrentCst'), isMac() ? 'Cmd + Q' : 'Ctrl + Q')}
        aria-label={tx('ui.aria.calculateCurrentCst')}
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
            title={tx('ui.action.createConstituenta')}
            icon={<IconNewItem size='1.25rem' className='icon-green' />}
            onClick={() => void promptCreateCst(activeCst.cst_type)}
            disabled={formDisabled}
          />
          <MiniButton
            title={
              isModified ? tx('labels.tooltip.unsaved') : prepareTooltip(tx('ui.hint.cloneConstituenta'), 'Alt + V')
            }
            aria-label={tx('ui.aria.cloneConstituenta')}
            icon={<IconClone size='1.25rem' className='icon-green' />}
            onClick={() => void cloneCst()}
            disabled={formDisabled || isModified}
          />
        </>
      ) : null}

      {isContentEditable && activeCst ? (
        <MiniButton
          title={tx('ui.action.deleteConstituenta')}
          icon={<IconDestroy size='1.25rem' className='icon-red' />}
          onClick={promptDeleteSelected}
          disabled={formDisabled || !canDeleteSelected}
        />
      ) : null}

      <BadgeHelp topic={HelpTopic.UI_MODEL_VALUE} offset={4} contentClass='sm:max-w-160' />
    </div>
  );
}
