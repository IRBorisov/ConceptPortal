'use client';

import clsx from 'clsx';

import { urls, useConceptNavigation } from '@/app';
import { HelpTopic } from '@/features/help';
import { BadgeHelp } from '@/features/help/components';
import { MiniSelectorOSS } from '@/features/library/components';
import { useFindPredecessor } from '@/features/oss/backend/use-find-predecessor';

import { MiniButton } from '@/components/control';
import {
  IconClone,
  IconDestroy,
  IconList,
  IconListOff,
  IconMoveDown,
  IconMoveUp,
  IconNewItem,
  IconPredecessor,
  IconReset,
  IconSave
} from '@/components/icons';
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

  onSubmit: () => void;
  onReset: () => void;
}

export function ToolbarConstituenta({
  className,
  activeCst,
  disabled,

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
    <div className={clsx('px-1 rounded-b-2xl backdrop-blur-xs cc-icons cc-animate-position outline-hidden', className)}>
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
            icon={<IconSave size='1.25rem' className='icon-primary' />}
            disabled={disabled || !isModified}
            onClick={onSubmit}
          />
          <MiniButton
            title='Сбросить несохраненные изменения'
            icon={<IconReset size='1.25rem' className='icon-primary' />}
            disabled={disabled || !isModified}
            onClick={onReset}
          />
          <MiniButton
            title='Создать конституенту после данной'
            icon={<IconNewItem size='1.25rem' className='icon-green' />}
            disabled={!isContentEditable || isProcessing}
            onClick={() => (activeCst ? createCst(activeCst.cst_type, false) : createCstDefault())}
          />
          <MiniButton
            titleHtml={isModified ? tooltipText.unsaved : prepareTooltip('Клонировать конституенту', 'Alt + V')}
            icon={<IconClone size='1.25rem' className='icon-green' />}
            disabled={disabled || isModified}
            onClick={cloneCst}
          />
          <MiniButton
            title='Удалить редактируемую конституенту'
            disabled={disabled || !canDeleteSelected}
            onClick={promptDeleteCst}
            icon={<IconDestroy size='1.25rem' className='icon-red' />}
          />
        </>
      ) : null}

      <MiniButton
        title='Отображение списка конституент'
        icon={showList ? <IconList size='1.25rem' className='icon-primary' /> : <IconListOff size='1.25rem' />}
        onClick={toggleList}
      />

      {isContentEditable ? (
        <>
          <MiniButton
            titleHtml={prepareTooltip('Переместить вверх', 'Alt + вверх')}
            icon={<IconMoveUp size='1.25rem' className='icon-primary' />}
            disabled={disabled || isModified || schema.items.length < 2}
            onClick={moveUp}
          />
          <MiniButton
            titleHtml={prepareTooltip('Переместить вниз', 'Alt + вниз')}
            icon={<IconMoveDown size='1.25rem' className='icon-primary' />}
            disabled={disabled || isModified || schema.items.length < 2}
            onClick={moveDown}
          />
        </>
      ) : null}
      <BadgeHelp topic={HelpTopic.UI_RS_EDITOR} offset={4} contentClass='sm:max-w-160' />
    </div>
  );
}
