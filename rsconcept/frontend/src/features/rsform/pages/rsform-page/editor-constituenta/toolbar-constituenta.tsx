'use client';

import { urls, useConceptNavigation } from '@/app';
import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components';
import { MiniSelectorOSS } from '@/features/library/components';
import { IconShowSidebar } from '@/features/library/components/icon-show-sidebar';
import { useFindPredecessor } from '@/features/oss/backend/use-find-predecessor';

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
import { tooltipText } from '@/utils/labels';
import { prepareTooltip } from '@/utils/utils';

import { useMutatingRSForm } from '../../../backend/use-mutating-rsform';
import { type IConstituenta } from '../../../models/rsform';
import { RSTabID, useRSEdit } from '../rsedit-context';

interface ToolbarConstituentaProps {
  className?: string;
  activeCst: IConstituenta | null;
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
  const { findPredecessor } = useFindPredecessor();
  const {
    schema,
    navigateOss,
    isContentEditable,
    createCst,
    createCstDefault,
    cloneCst,
    canDeleteSelected,
    promptDeleteCst,
    moveUp,
    moveDown
  } = useRSEdit();

  const showList = usePreferencesStore(state => state.showCstSideList);
  const toggleList = usePreferencesStore(state => state.toggleShowCstSideList);
  const { isModified } = useModificationStore();
  const isProcessing = useMutatingRSForm();

  function viewPredecessor(target: number) {
    void findPredecessor(target).then(reference =>
      router.push({
        path: urls.schema_props({
          id: reference.schema,
          active: reference.id,
          tab: RSTabID.CST_EDIT
        })
      })
    );
  }

  return (
    <div className={cn('px-1 rounded-b-2xl backdrop-blur-xs cc-icons outline-hidden', className)}>
      {schema.oss.length > 0 ? (
        <MiniSelectorOSS
          items={schema.oss}
          onSelect={(event, value) => navigateOss(value.id, event.ctrlKey || event.metaKey)}
        />
      ) : null}
      {activeCst?.is_inherited ? (
        <MiniButton
          title='Перейти к исходной конституенте в ОСС'
          onClick={() => viewPredecessor(activeCst.id)}
          icon={<IconPredecessor size='1.25rem' className='icon-primary' />}
        />
      ) : null}
      {isContentEditable ? (
        <>
          <MiniButton
            titleHtml={prepareTooltip('Сохранить изменения', 'Ctrl + S')}
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
            onClick={() => (activeCst ? createCst(activeCst.cst_type, false) : createCstDefault())}
            disabled={!isContentEditable || isProcessing}
          />
          <MiniButton
            titleHtml={isModified ? tooltipText.unsaved : prepareTooltip('Клонировать конституенту', 'Alt + V')}
            aria-label='Клонировать конституенту'
            icon={<IconClone size='1.25rem' className='icon-green' />}
            onClick={cloneCst}
            disabled={disabled || isModified}
          />
          <MiniButton
            title='Удалить редактируемую конституенту'
            onClick={promptDeleteCst}
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
