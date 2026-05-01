'use client';

import { type Constituenta } from '@/domain/library';

import { useConceptNavigation } from '@/app';
import { useTx } from '@/app/i18n/use-tx';
import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { MiniSelectorOSS } from '@/features/library/components/mini-selector-oss';

import { MiniButton } from '@/components/control';
import { IconClone, IconDestroy, IconNewItem, IconPredecessor, IconReset, IconSave } from '@/components/icons';
import { cn } from '@/components/utils';
import { useModificationStore } from '@/stores/modification';
import { prepareTooltip } from '@/utils/format';
import { formatLabel, lid } from '@/utils/labels';
import { isMac } from '@/utils/utils';

import { useSchemaEdit } from '../schema-edit-context';

interface ToolbarConstituentaProps {
  className?: string;
  hasInheritance: boolean;
  activeCst: Constituenta | null;
  disabled: boolean;

  onSubmit: () => void;
  onReset: () => void;
}

export function ToolbarConstituenta({
  className,
  activeCst,
  disabled,
  hasInheritance,

  onSubmit,
  onReset
}: ToolbarConstituentaProps) {
  const tx = useTx();
  const router = useConceptNavigation();
  const {
    schema,
    isContentEditable,
    isProcessing,
    promptCreateCst,
    cloneCst,
    canDeleteSelected,
    promptDeleteSelected,
    gotoPredecessor: openConstituentaPredecessor
  } = useSchemaEdit();

  const isModified = useModificationStore(state => state.isModified);

  return (
    <div className={cn('px-1 rounded-b-2xl cc-icons outline-hidden', className)}>
      {schema.oss.length > 0 ? (
        <MiniSelectorOSS
          items={schema.oss}
          onSelect={(event, value) => router.gotoOss(value.id, event.ctrlKey || event.metaKey)}
        />
      ) : null}
      {activeCst && hasInheritance ? (
        <MiniButton
          title={
            activeCst.is_inherited
              ? tx('ui.cst.gotoSourceInOss', 'Go to source constituent in OSS')
              : tx('ui.cst.noPredecessor', 'Constituent has no predecessor')
          }
          onClick={event => openConstituentaPredecessor(activeCst.id, event.ctrlKey || event.metaKey)}
          icon={<IconPredecessor size='1.25rem' className='icon-primary' />}
          disabled={!activeCst.is_inherited}
        />
      ) : null}
      {isContentEditable && activeCst ? (
        <>
          <MiniButton
            title={prepareTooltip(tx('ui.action.saveChanges', 'Save changes'), isMac() ? 'Cmd + S' : 'Ctrl + S')}
            aria-label={tx('ui.action.saveChanges', 'Save changes')}
            icon={<IconSave size='1.25rem' className='icon-primary' />}
            onClick={onSubmit}
            disabled={disabled || !isModified}
          />
          <MiniButton
            title={tx('ui.hint.resetUnsavedConstituenta', 'Discard unsaved changes')}
            icon={<IconReset size='1.25rem' className='icon-primary' />}
            onClick={onReset}
            disabled={disabled || !isModified}
          />
          <MiniButton
            title={tx('ui.action.createConstituenta', 'Create constituent')}
            icon={<IconNewItem size='1.25rem' className='icon-green' />}
            onClick={() => void promptCreateCst(activeCst.cst_type)}
            disabled={!isContentEditable || isProcessing}
          />
          <MiniButton
            title={
              isModified
                ? formatLabel(lid.tooltip.unsaved)
                : prepareTooltip(tx('ui.hint.cloneConstituenta', 'Clone constituent'), 'Alt + V')
            }
            aria-label={tx('ui.aria.cloneConstituenta', 'Clone constituent')}
            icon={<IconClone size='1.25rem' className='icon-green' />}
            onClick={() => void cloneCst()}
            disabled={disabled || isModified}
          />
          <MiniButton
            title={tx('ui.action.deleteConstituenta', 'Delete constituent')}
            icon={<IconDestroy size='1.25rem' className='icon-red' />}
            onClick={promptDeleteSelected}
            disabled={disabled || !canDeleteSelected}
          />
        </>
      ) : null}

      <BadgeHelp topic={HelpTopic.UI_SCHEMA_EDITOR} offset={4} contentClass='sm:max-w-160' />
    </div>
  );
}
