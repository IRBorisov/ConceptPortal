'use client';

import { useMemo } from 'react';
import { BiDiamond, BiDuplicate, BiPlusCircle, BiReset, BiTrash } from 'react-icons/bi';
import { FiSave } from "react-icons/fi";

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
  onTemplates: () => void
}

function ConstituentaToolbar({
  isMutable, isModified,
  onSubmit, onReset,
  onDelete, onClone, onCreate, onTemplates
}: ConstituentaToolbarProps) {
  const canSave = useMemo(() => (isModified && isMutable), [isModified, isMutable]);
  return (
  <Overlay position='right-1/2 translate-x-1/2 top-1 flex items-start'>
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
      tooltip='Создать конституенту из шаблона [Alt + E]'
      icon={<BiDiamond className={isMutable ? 'clr-text-primary': ''} size={'1.25rem'}/>}
      disabled={!isMutable}
      onClick={onTemplates}
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