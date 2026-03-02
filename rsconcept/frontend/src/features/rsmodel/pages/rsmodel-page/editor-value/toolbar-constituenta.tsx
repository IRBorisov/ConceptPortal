'use client';

import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components/badge-help';
import { IconShowSidebar } from '@/features/library/components/icon-show-sidebar';
import { useRSFormEdit } from '@/features/rsform/pages/rsform-page/rsedit-context';

import { MiniButton } from '@/components/control';
import {
  IconDestroy,
  IconMoveDown,
  IconMoveUp,
  IconReset,
  IconSave
} from '@/components/icons';
import { cn } from '@/components/utils';
import { useModificationStore } from '@/stores/modification';
import { usePreferencesStore } from '@/stores/preferences';
import { isMac, prepareTooltip } from '@/utils/utils';

interface ToolbarConstituentaProps {
  className?: string;
  disabled: boolean;
  isNarrow: boolean;

  onSubmit: () => void;
  onReset: () => void;
}

export function ToolbarConstituenta({
  className,
  disabled,
  isNarrow,

  onSubmit,
  onReset
}: ToolbarConstituentaProps) {
  const {
    schema,
    isContentEditable,
    canDeleteSelected,
    promptDeleteSelected,
    moveUp,
    moveDown
  } = useRSFormEdit();

  const showList = usePreferencesStore(state => state.showCstSideList);
  const toggleList = usePreferencesStore(state => state.toggleShowCstSideList);
  const isModified = useModificationStore(state => state.isModified);

  return (
    <div className={cn('px-1 rounded-b-2xl cc-icons outline-hidden', className)}>
      {isContentEditable ? (
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
