import { useMemo } from 'react';

import ConceptTooltip from '../../../components/Common/ConceptTooltip';
import Dropdown from '../../../components/Common/Dropdown';
import DropdownButton from '../../../components/Common/DropdownButton';
import MiniButton from '../../../components/Common/MiniButton';
import HelpRSFormItems from '../../../components/Help/HelpRSFormItems';
import { ArrowDownIcon, ArrowDropdownIcon, ArrowUpIcon, CloneIcon, DiamondIcon, DumpBinIcon, HelpIcon, SmallPlusIcon,UpdateIcon } from '../../../components/Icons';
import useDropdown from '../../../hooks/useDropdown';
import { CstType } from '../../../models/rsform';
import { prefixes } from '../../../utils/constants';
import { labelCstType } from '../../../utils/labels';
import { getCstTypePrefix, getCstTypeShortcut } from '../../../utils/misc';

interface RSListToolbarProps {
  editorMode?: boolean
  selectedCount: number

  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  onClone: () => void
  onCreate: (type?: CstType) => void
  onTemplates: () => void
  onReindex: () => void
}

function RSListToolbar({
  selectedCount, editorMode,
  onMoveUp, onMoveDown, onDelete, onClone, onCreate, onTemplates, onReindex
}: RSListToolbarProps) {
  const insertMenu = useDropdown();

  const nothingSelected = useMemo(() => selectedCount === 0, [selectedCount]);

  return (
  <div className='flex items-center justify-center w-full mr-[9rem]'>
    <MiniButton
      tooltip='Переместить вверх [Alt + вверх]'
      icon={<ArrowUpIcon size={5}/>}
      disabled={!editorMode || nothingSelected}
      onClick={onMoveUp}
    />
    <MiniButton
      tooltip='Переместить вниз [Alt + вниз]'
      icon={<ArrowDownIcon size={5}/>}
      disabled={!editorMode || nothingSelected}
      onClick={onMoveDown}
    />
    <MiniButton
      tooltip='Клонировать конституенту [Alt + V]'
      icon={<CloneIcon color={editorMode && selectedCount === 1 ? 'text-success': ''} size={5}/>}
      disabled={!editorMode || selectedCount !== 1}
      onClick={onClone}
    />
    <MiniButton
      tooltip='Добавить новую конституенту... [Alt + `]'
      icon={<SmallPlusIcon color={editorMode ? 'text-success': ''} size={5}/>}
      disabled={!editorMode}
      onClick={() => onCreate()}
    />
    <div ref={insertMenu.ref} className='flex justify-center'>
      <MiniButton
        tooltip='Добавить пустую конституенту'
        icon={<ArrowDropdownIcon color={editorMode ? 'text-success': ''} size={5}/>}
        disabled={!editorMode}
        onClick={insertMenu.toggle}
      />
      {insertMenu.isActive ?
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
      </Dropdown> : null}
    </div>
    <MiniButton
      tooltip='Создать конституенту из шаблона'
      icon={<DiamondIcon color={editorMode ? 'text-primary': ''} size={5}/>}
      disabled={!editorMode}
      onClick={onTemplates}
    />
    <MiniButton
      tooltip='Сброс имен: присвоить порядковые имена'
      icon={<UpdateIcon color={editorMode ? 'text-primary': ''} size={5}/>}
      disabled={!editorMode}
      onClick={onReindex}
    />
    <MiniButton
      tooltip='Удалить выбранные [Delete]'
      icon={<DumpBinIcon color={editorMode && !nothingSelected ? 'text-warning' : ''} size={5}/>}
      disabled={!editorMode || nothingSelected}
      onClick={onDelete}
    />
    <div className='ml-1' id='items-table-help'>
      <HelpIcon color='text-primary' size={5} />
    </div>
    <ConceptTooltip anchorSelect='#items-table-help' offset={8}>
      <HelpRSFormItems />
    </ConceptTooltip>
  </div>);
}

export default RSListToolbar;