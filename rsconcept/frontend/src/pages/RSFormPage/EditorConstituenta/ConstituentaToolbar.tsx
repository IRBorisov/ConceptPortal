import { useMemo } from 'react'

import ConceptTooltip from '../../../components/Common/ConceptTooltip'
import MiniButton from '../../../components/Common/MiniButton'
import HelpConstituenta from '../../../components/Help/HelpConstituenta'
import { ArrowsRotateIcon, CloneIcon, DiamondIcon, DumpBinIcon, HelpIcon, SaveIcon, SmallPlusIcon } from '../../../components/Icons'

interface ConstituentaToolbarProps {
  editorMode: boolean
  isModified: boolean

  onSubmit: () => void
  onReset: () => void

  onDelete: () => void
  onClone: () => void
  onCreate: () => void
  onTemplates: () => void
}

function ConstituentaToolbar({
  editorMode, isModified,
  onSubmit, onReset,
  onDelete, onClone, onCreate, onTemplates
}: ConstituentaToolbarProps) {
  const canSave = useMemo(() => (isModified && editorMode), [isModified, editorMode]);
  return (    
  <div className='relative w-full'>
  <div className='absolute right-0 flex items-start justify-center w-full select-none top-1'>
    <MiniButton
      tooltip='Сохранить изменения'
      disabled={!canSave}
      icon={<SaveIcon size={5} color={canSave ? 'text-primary' : ''}/>}
      onClick={onSubmit}
    />
    <MiniButton
      tooltip='Сборсить несохраненные изменения'
      disabled={!canSave}
      onClick={onReset}
      icon={<ArrowsRotateIcon size={5} color={canSave ? 'text-primary' : ''} />}
    />
    <MiniButton
      tooltip='Создать конституенту после данной'
      disabled={!editorMode}
      onClick={onCreate}
      icon={<SmallPlusIcon size={5} color={editorMode ? 'text-success' : ''} />} 
    />
    <MiniButton
      tooltip='Клонировать конституенту'
      disabled={!editorMode}
      onClick={onClone}
      icon={<CloneIcon size={5} color={editorMode ? 'text-success' : ''} />} 
    />
    <MiniButton
      tooltip='Создать конституенту из шаблона'
      icon={<DiamondIcon color={editorMode ? 'text-primary': ''} size={5}/>}
      disabled={!editorMode}
      onClick={onTemplates}
    />
    <MiniButton
      tooltip='Удалить редактируемую конституенту'
      disabled={!editorMode}
      onClick={onDelete}
      icon={<DumpBinIcon size={5} color={editorMode ? 'text-warning' : ''} />}
    />
    <div id='cst-help' className='px-1 py-1'>
      <HelpIcon color='text-primary' size={5} />
    </div>
    <ConceptTooltip anchorSelect='#cst-help' offset={4}>
      <HelpConstituenta />
    </ConceptTooltip>
  </div>
  </div>);
}

export default ConstituentaToolbar;