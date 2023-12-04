import { useMemo } from 'react'

import ConceptTooltip from '../../../components/Common/ConceptTooltip'
import MiniButton from '../../../components/Common/MiniButton'
import HelpConstituenta from '../../../components/Help/HelpConstituenta'
import { ArrowsRotateIcon, CloneIcon, DiamondIcon, DumpBinIcon, HelpIcon, SaveIcon, SmallPlusIcon } from '../../../components/Icons'

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
  <div className='relative w-full'>
  <div className='absolute right-0 flex items-start justify-center w-full top-1'>
  <div className='flex justify-start select-auto w-fit z-tooltip'>
    <MiniButton
      tooltip='Сохранить изменения'
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
      tooltip='Клонировать конституенту'
      disabled={!isMutable}
      onClick={onClone}
      icon={<CloneIcon size={5} color={isMutable ? 'text-success' : ''} />} 
    />
    <MiniButton
      tooltip='Создать конституенту из шаблона'
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
    <div id='cst-help' className='px-1 py-1'>
      <HelpIcon color='text-primary' size={5} />
    </div>
    <ConceptTooltip
      anchorSelect='#cst-help'
      offset={4}
    >
      <HelpConstituenta />
    </ConceptTooltip>
  </div>
  </div>
  </div>);
}

export default ConstituentaToolbar;