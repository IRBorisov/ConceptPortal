'use client';

import { useMemo } from 'react';

import MiniButton from '@/components/Common/MiniButton';
import Overlay from '@/components/Common/Overlay';
import HelpButton from '@/components/Help/HelpButton';
import { 
  ArrowsRotateIcon, CloneIcon, DiamondIcon, DumpBinIcon, SaveIcon, SmallPlusIcon
} from '@/components/Icons';
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
      icon={<SaveIcon size={5} color={canSave ? 'text-primary' : ''}/>}
      onClick={onSubmit}
    />
    <MiniButton
      tooltip='Сбросить несохраненные изменения'
      disabled={!canSave}
      onClick={onReset}
      icon={<ArrowsRotateIcon size={5} color={canSave ? 'text-primary' : ''} />}
    />
    <MiniButton
      tooltip='Создать конституенту после данной'
      disabled={!isMutable}
      onClick={onCreate}
      icon={<SmallPlusIcon size={5} color={isMutable ? 'text-success' : ''} />} 
    />
    <MiniButton
      tooltip='Клонировать конституенту [Alt + V]'
      disabled={!isMutable}
      onClick={onClone}
      icon={<CloneIcon size={5} color={isMutable ? 'text-success' : ''} />} 
    />
    <MiniButton
      tooltip='Создать конституенту из шаблона [Alt + E]'
      icon={<DiamondIcon color={isMutable ? 'text-primary': ''} size={5}/>}
      disabled={!isMutable}
      onClick={onTemplates}
    />
    <MiniButton
      tooltip='Удалить редактируемую конституенту'
      disabled={!isMutable}
      onClick={onDelete}
      icon={<DumpBinIcon size={5} color={isMutable ? 'text-warning' : ''} />}
    />
    <HelpButton topic={HelpTopic.CONSTITUENTA} offset={4} />
  </Overlay>);
}

export default ConstituentaToolbar;