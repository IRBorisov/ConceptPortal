'use client';

import { useMemo } from 'react';
import { BiDownvote, BiDuplicate, BiPlusCircle, BiReset, BiTrash, BiUpvote } from 'react-icons/bi';
import { FiSave } from 'react-icons/fi';

import HelpButton from '@/components/Help/HelpButton';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import { HelpTopic } from '@/models/miscellaneous';

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
    <Overlay position='top-1 right-1/2 translate-x-1/2' className='flex'>
      <MiniButton
        title='Сохранить изменения [Ctrl + S]'
        disabled={!canSave}
        icon={<FiSave size='1.25rem' className={canSave ? 'clr-text-primary' : ''} />}
        onClick={onSubmit}
      />
      <MiniButton
        title='Сбросить несохраненные изменения'
        disabled={!canSave}
        onClick={onReset}
        icon={<BiReset size='1.25rem' className={canSave ? 'clr-text-primary' : ''} />}
      />
      <MiniButton
        title='Создать конституенту после данной'
        disabled={!isMutable}
        onClick={onCreate}
        icon={<BiPlusCircle size={'1.25rem'} className={isMutable ? 'clr-text-success' : ''} />}
      />
      <MiniButton
        title='Клонировать конституенту [Alt + V]'
        disabled={!isMutable}
        onClick={onClone}
        icon={<BiDuplicate size='1.25rem' className={isMutable ? 'clr-text-success' : ''} />}
      />
      <MiniButton
        title='Удалить редактируемую конституенту'
        disabled={!isMutable}
        onClick={onDelete}
        icon={<BiTrash size='1.25rem' className={isMutable ? 'clr-text-warning' : ''} />}
      />
      <MiniButton
        title='Переместить вверх [Alt + вверх]'
        icon={<BiUpvote size='1.25rem' className={isMutable ? 'clr-text-primary' : ''} />}
        disabled={!isMutable}
        onClick={onMoveUp}
      />
      <MiniButton
        title='Переместить вниз [Alt + вниз]'
        icon={<BiDownvote size='1.25rem' className={isMutable ? 'clr-text-primary' : ''} />}
        disabled={!isMutable}
        onClick={onMoveDown}
      />
      <HelpButton topic={HelpTopic.CONSTITUENTA} offset={4} />
    </Overlay>
  );
}

export default ConstituentaToolbar;
