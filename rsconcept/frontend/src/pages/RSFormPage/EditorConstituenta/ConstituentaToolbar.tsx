'use client';

import { useMemo } from 'react';
import { BiDuplicate, BiPlusCircle, BiReset, BiTrash } from 'react-icons/bi';
import { FiSave } from 'react-icons/fi';

import MiniButton from '@/components/Common/MiniButton';
import Overlay from '@/components/Common/Overlay';
import HelpButton from '@/components/Help/HelpButton';
import { HelpTopic } from '@/models/miscelanious';

interface ConstituentaToolbarProps {
  isMutable: boolean
  isModified: boolean

  onSubmit: () => void
  onReset: () => void

  onDelete: () => void
  onClone: () => void
  onCreate: () => void
}

function ConstituentaToolbar({
  isMutable, isModified,
  onSubmit, onReset,
  onDelete, onClone, onCreate
}: ConstituentaToolbarProps) {
  const canSave = useMemo(() => (isModified && isMutable), [isModified, isMutable]);
  return (
    <Overlay position='top-1 right-1/2 translate-x-1/2' className='flex'>
    <MiniButton
      tooltip='Сохранить изменения [Ctrl + S]'
      disabled={!canSave}
      icon={<FiSave size='1.25rem' className={canSave ? 'clr-text-primary' : ''}/>}
      onClick={onSubmit}
    />
    <MiniButton
      tooltip='Сбросить несохраненные изменения'
      disabled={!canSave}
      onClick={onReset}
      icon={<BiReset size='1.25rem' className={canSave ? 'clr-text-primary' : ''} />}
    />
    <MiniButton
      tooltip='Создать конституенту после данной'
      disabled={!isMutable}
      onClick={onCreate}
      icon={<BiPlusCircle size={'1.25rem'} className={isMutable ? 'clr-text-success' : ''} />} 
    />
    <MiniButton
      tooltip='Клонировать конституенту [Alt + V]'
      disabled={!isMutable}
      onClick={onClone}
      icon={<BiDuplicate size='1.25rem' className={isMutable ? 'clr-text-success' : ''} />} 
    />
    <MiniButton
      tooltip='Удалить редактируемую конституенту'
      disabled={!isMutable}
      onClick={onDelete}
      icon={<BiTrash size='1.25rem' className={isMutable ? 'clr-text-warning' : ''} />}
    />
    <HelpButton topic={HelpTopic.CONSTITUENTA} offset={4} />
  </Overlay>);
}

export default ConstituentaToolbar;