'use client';

import { useConceptNavigation } from '@/app';
import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { IconShowSidebar } from '@/features/library/components/icon-show-sidebar';
import { MiniSelectorOSS } from '@/features/library/components/mini-selector-oss';

import { MiniButton } from '@/components/control';
import {
  IconClone,
  IconDestroy,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconPredecessor,
  IconReset,
  IconSave
} from '@/components/icons';
import { cn } from '@/components/utils';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { prepareTooltip } from '@/utils/format';
import { tooltipText } from '@/utils/labels';
import { isMac } from '@/utils/utils';

import { type Constituenta } from '../../../models/rsform';
import { useRSFormEdit } from '../rsedit-context';

interface ToolbarConstituentaProps {
  className?: string;
  activeCst: Constituenta | null;
  disabled: boolean;
  isNarrow: boolean;

  onSubmit: () => void;
  onReset: () => void;
}

export function ToolbarConstituenta({
  className,
  activeCst,
  disabled,
  isNarrow,

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
    moveUp,
    moveDown,
    gotoPredecessor: openConstituentaPredecessor
  } = useRSFormEdit();

  const showList = usePreferencesStore(state => state.showCstSideList);
  const toggleList = usePreferencesStore(state => state.toggleShowCstSideList);
  const isModified = useModificationStore(state => state.isModified);

  return (
    <div className={cn('px-1 rounded-b-2xl cc-icons outline-hidden', className)}>
      {schema.oss.length > 0 ? (
        <MiniSelectorOSS
          items={schema.oss}
          onSelect={(event, value) => router.gotoOss(value.id, event.ctrlKey || event.metaKey)}
        />
      ) : null}
      {activeCst ? (
        <MiniButton
          title={activeCst.is_inherited ? 'Перейти к исходной конституенте в ОСС' : 'Конституента не имеет предка'}
          onClick={event => openConstituentaPredecessor(activeCst.id, event.ctrlKey || event.metaKey)}
          icon={<IconPredecessor size='1.25rem' className='icon-primary' />}
          disabled={!activeCst.is_inherited}
        />) : null}
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
            title='Создать конституенту после данной'
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
            title='Удалить редактируемую конституенту'
            onClick={promptDeleteSelected}
            icon={<IconDestroy size='1.25rem' className='icon-red' />}
            disabled={disabled || !canDeleteSelected}
          />
        </>
      ) : null}

      {isContentEditable ? (
        <>
          <MiniButton
            titleHtml={prepareTooltip('Переместить вверх', 'Alt + вверх')}
            aria-label='Переместить вверх'
            icon={<IconMoveUp size='1.25rem' className='icon-primary' />}
            onClick={moveUp}
            disabled={disabled || isModified || schema.items.length < 2}
          />
          <MiniButton
            titleHtml={prepareTooltip('Переместить вниз', 'Alt + вниз')}
            aria-label='Переместить вниз'
            icon={<IconMoveDown size='1.25rem' className='icon-primary' />}
            onClick={moveDown}
            disabled={disabled || isModified || schema.items.length < 2}
          />
        </>
      ) : null}

      <MiniButton
        title='Отображение списка конституент'
        icon={<IconShowSidebar size='1.25rem' value={showList} isBottom={isNarrow} />}
        onClick={toggleList}
      />
      <BadgeHelp topic={HelpTopic.UI_RS_EDITOR} offset={4} contentClass='sm:max-w-160' />
    </div>
  );
}
