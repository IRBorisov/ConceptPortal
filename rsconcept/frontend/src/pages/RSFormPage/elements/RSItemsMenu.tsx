import { useMemo } from 'react';

import ConceptTooltip from '../../../components/Common/ConceptTooltip';
import Dropdown from '../../../components/Common/Dropdown';
import DropdownButton from '../../../components/Common/DropdownButton';
import MiniButton from '../../../components/Common/MiniButton';
import HelpRSFormItems from '../../../components/Help/HelpRSFormItems';
import { ArrowDownIcon, ArrowDropdownIcon, ArrowUpIcon, CloneIcon, DiamondIcon, DumpBinIcon, HelpIcon, SmallPlusIcon,UpdateIcon } from '../../../components/Icons';
import { useRSForm } from '../../../context/RSFormContext';
import useDropdown from '../../../hooks/useDropdown';
import { CstType } from '../../../models/rsform';
import { prefixes } from '../../../utils/constants';
import { labelCstType } from '../../../utils/labels';
import { getCstTypePrefix, getCstTypeShortcut } from '../../../utils/misc';

interface RSItemsMenuProps {
  selected: number[]

  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  onClone: () => void
  onCreate: (type?: CstType) => void
  onTemplates: () => void
  onReindex: () => void
}

function RSItemsMenu({
  selected,
  onMoveUp, onMoveDown, onDelete, onClone, onCreate, onTemplates, onReindex
}: RSItemsMenuProps) {
  const { isEditable } = useRSForm();
  const insertMenu = useDropdown();

  const nothingSelected = useMemo(() => selected.length === 0, [selected]);

  return (    
  <div className='flex items-center justify-center w-full pr-[9rem]'>
    <MiniButton
      tooltip='Переместить вверх'
      icon={<ArrowUpIcon size={5}/>}
      disabled={!isEditable || nothingSelected}
      onClick={onMoveUp}
    />
    <MiniButton
      tooltip='Переместить вниз'
      icon={<ArrowDownIcon size={5}/>}
      disabled={!isEditable || nothingSelected}
      onClick={onMoveDown}
    />
    <MiniButton
      tooltip='Удалить выбранные'
      icon={<DumpBinIcon color={isEditable && !nothingSelected ? 'text-warning' : ''} size={5}/>}
      disabled={!isEditable || nothingSelected}
      onClick={onDelete}
    />
    <MiniButton
      tooltip='Клонировать конституенту'
      icon={<CloneIcon color={isEditable && selected.length === 1 ? 'text-success': ''} size={5}/>}
      disabled={!isEditable || selected.length !== 1}
      onClick={onClone}
    />
    <MiniButton
      tooltip='Добавить новую конституенту...'
      icon={<SmallPlusIcon color={isEditable ? 'text-success': ''} size={5}/>}
      disabled={!isEditable}
      onClick={() => onCreate()}
    />
    <div ref={insertMenu.ref} className='flex justify-center'>
      <MiniButton
        tooltip='Добавить пустую конституенту'
        icon={<ArrowDropdownIcon color={isEditable ? 'text-success': ''} size={5}/>}
        disabled={!isEditable}
        onClick={insertMenu.toggle}
      />
      { insertMenu.isActive && 
      <Dropdown>
      {(Object.values(CstType)).map(
      (typeStr) => {
        const type = typeStr as CstType;
        return (
        <DropdownButton
          key={`${prefixes.csttype_list}${typeStr}`}
          onClick={() => onCreate(type)}
          tooltip={getCstTypeShortcut(type)}
        >
          {`${getCstTypePrefix(type)}1 — ${labelCstType(type)}`}
        </DropdownButton>);
      })}
      </Dropdown>}
    </div>

    <MiniButton
      tooltip='Создать конституенту из шаблона'
      icon={<DiamondIcon color={isEditable ? 'text-primary': ''} size={5}/>}
      disabled={!isEditable}
      onClick={onTemplates}
    />

    <MiniButton
      tooltip='Сброс имен: присвоить порядковые имена'
      icon={<UpdateIcon color={isEditable ? 'text-primary': ''} size={5}/>}
      disabled={!isEditable}
      onClick={onReindex}
    />
    
    <div className='ml-1' id='items-table-help'>
      <HelpIcon color='text-primary' size={5} />
    </div>
    <ConceptTooltip anchorSelect='#items-table-help' offset={8}>
      <HelpRSFormItems />
    </ConceptTooltip>
  </div>);
}

export default RSItemsMenu;