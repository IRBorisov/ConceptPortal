'use client';

import { useMemo } from 'react';
import { BiDownvote, BiDuplicate, BiPlusCircle, BiReset, BiTrash, BiUpvote } from 'react-icons/bi';
import { FiSave } from 'react-icons/fi';

import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { messages, prepareTooltip } from '@/utils/labels';

interface ConstituentaToolbarProps {
  isMutable: boolean;
  isModified: boolean;

  onSubmit: () => void;
  onReset: () => void;

  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onClone: () => void;
  onCreate: () => void;
}

function ConstituentaToolbar({
  isMutable,
  isModified,
  onSubmit,
  onReset,
  onMoveUp,
  onMoveDown,
  onDelete,
  onClone,
  onCreate
}: ConstituentaToolbarProps) {
  const canSave = useMemo(() => isModified && isMutable, [isModified, isMutable]);
  return (
    <Overlay position='top-1 right-4 sm:right-1/2 sm:translate-x-1/2' className='flex'>
      <MiniButton
        titleHtml={prepareTooltip('Сохранить изменения', 'Ctrl + S')}
        disabled={!canSave}
        icon={<FiSave size='1.25rem' className='icon-primary' />}
        onClick={onSubmit}
      />
      <MiniButton
        title='Сбросить несохраненные изменения'
        disabled={!canSave}
        onClick={onReset}
        icon={<BiReset size='1.25rem' className='icon-primary' />}
      />
      <MiniButton
        title='Создать конституенту после данной'
        disabled={!isMutable}
        onClick={onCreate}
        icon={<BiPlusCircle size={'1.25rem'} className='icon-green' />}
      />
      <MiniButton
        titleHtml={isModified ? messages.unsaved : prepareTooltip('Клонировать конституенту', 'Alt + V')}
        disabled={!isMutable || isModified}
        onClick={onClone}
        icon={<BiDuplicate size='1.25rem' className='icon-green' />}
      />
      <MiniButton
        title='Удалить редактируемую конституенту'
        disabled={!isMutable}
        onClick={onDelete}
        icon={<BiTrash size='1.25rem' className='icon-red' />}
      />
      <MiniButton
        titleHtml={prepareTooltip('Переместить вверх', 'Alt + вверх')}
        icon={<BiUpvote size='1.25rem' className='icon-primary' />}
        disabled={!isMutable}
        onClick={onMoveUp}
      />
      <MiniButton
        titleHtml={prepareTooltip('Переместить вниз', 'Alt + вниз')}
        icon={<BiDownvote size='1.25rem' className='icon-primary' />}
        disabled={!isMutable}
        onClick={onMoveDown}
      />
    </Overlay>
  );
}

export default ConstituentaToolbar;
