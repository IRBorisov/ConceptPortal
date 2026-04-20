'use client';

import { type Constituenta } from '@/domain/library';

import { useConceptNavigation } from '@/app';
import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { MiniSelectorOSS } from '@/features/library/components/mini-selector-oss';

import { MiniButton } from '@/components/control';
import { IconClone, IconDestroy, IconNewItem, IconPredecessor, IconReset, IconSave } from '@/components/icons';
import { cn } from '@/components/utils';
import { useModificationStore } from '@/stores/modification';
import { prepareTooltip } from '@/utils/format';
import { tooltipText } from '@/utils/labels';
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
          title={activeCst.is_inherited ? 'Перейти к исходной конституенте в ОСС' : 'Конституента не имеет предка'}
          onClick={event => openConstituentaPredecessor(activeCst.id, event.ctrlKey || event.metaKey)}
          icon={<IconPredecessor size='1.25rem' className='icon-primary' />}
          disabled={!activeCst.is_inherited}
        />
      ) : null}
      {isContentEditable && activeCst ? (
        <>
          <MiniButton
            titleHtml={prepareTooltip('Сохранить изменения', isMac() ? 'Cmd + S' : 'Ctrl + S')}
            aria-label='Сохранить изменения'
            icon={<IconSave size='1.25rem' className='icon-primary' />}
            onClick={onSubmit}
            disabled={disabled || !isModified}
          />
          <MiniButton
            title='Сбросить несохраненные изменения'
            icon={<IconReset size='1.25rem' className='icon-primary' />}
            onClick={onReset}
            disabled={disabled || !isModified}
          />
          <MiniButton
            title='Создать конституенту'
            icon={<IconNewItem size='1.25rem' className='icon-green' />}
            onClick={() => void promptCreateCst(activeCst.cst_type)}
            disabled={!isContentEditable || isProcessing}
          />
          <MiniButton
            titleHtml={isModified ? tooltipText.unsaved : prepareTooltip('Клонировать конституенту', 'Alt + V')}
            aria-label='Клонировать конституенту'
            icon={<IconClone size='1.25rem' className='icon-green' />}
            onClick={() => void cloneCst()}
            disabled={disabled || isModified}
          />
          <MiniButton
            title='Удалить конституенту'
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
