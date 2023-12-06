import { useMemo } from 'react';

import Dropdown from '../../../components/Common/Dropdown';
import DropdownButton from '../../../components/Common/DropdownButton';
import MiniButton from '../../../components/Common/MiniButton';
import Overlay from '../../../components/Common/Overlay';
import HelpButton from '../../../components/Help/HelpButton';
import { ArrowDownIcon, ArrowDropdownIcon, ArrowUpIcon, CloneIcon, DiamondIcon, DumpBinIcon, SmallPlusIcon, UpdateIcon } from '../../../components/Icons';
import useDropdown from '../../../hooks/useDropdown';
import { HelpTopic } from '../../../models/miscelanious';
import { CstType } from '../../../models/rsform';
import { prefixes } from '../../../utils/constants';
import { labelCstType } from '../../../utils/labels';
import { getCstTypePrefix, getCstTypeShortcut } from '../../../utils/misc';

interface RSListToolbarProps {
  isMutable?: boolean
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
  selectedCount, isMutable,
  onMoveUp, onMoveDown, onDelete, onClone,
  onCreate, onTemplates, onReindex
}: RSListToolbarProps) {
  const insertMenu = useDropdown();
  const nothingSelected = useMemo(() => selectedCount === 0, [selectedCount]);
  
  return (
  <Overlay position='w-full top-1 flex items-start justify-center'>
    <MiniButton
      tooltip='Переместить вверх [Alt + вверх]'
      icon={<ArrowUpIcon size={5}/>}
      disabled={!isMutable || nothingSelected}
      onClick={onMoveUp}
    />
    <MiniButton
      tooltip='Переместить вниз [Alt + вниз]'
      icon={<ArrowDownIcon size={5}/>}
      disabled={!isMutable || nothingSelected}
      onClick={onMoveDown}
    />
    <MiniButton
      tooltip='Клонировать конституенту [Alt + V]'
      icon={<CloneIcon color={isMutable && selectedCount === 1 ? 'text-success': ''} size={5}/>}
      disabled={!isMutable || selectedCount !== 1}
      onClick={onClone}
    />
    <MiniButton
      tooltip='Добавить новую конституенту... [Alt + `]'
      icon={<SmallPlusIcon color={isMutable ? 'text-success': ''} size={5}/>}
      disabled={!isMutable}
      onClick={() => onCreate()}
    />
    <div ref={insertMenu.ref} className='flex justify-center'>
      <div>
        <MiniButton
          tooltip='Добавить пустую конституенту'
          icon={<ArrowDropdownIcon color={isMutable ? 'text-success': ''} size={5}/>}
          disabled={!isMutable}
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
    </div>
    <MiniButton
      tooltip='Создать конституенту из шаблона [Alt + E]'
      icon={<DiamondIcon color={isMutable ? 'text-primary': ''} size={5}/>}
      disabled={!isMutable}
      onClick={onTemplates}
    />
    <MiniButton
      tooltip='Сброс имен: присвоить порядковые имена [Alt + R]'
      icon={<UpdateIcon color={isMutable ? 'text-primary': ''} size={5}/>}
      disabled={!isMutable}
      onClick={onReindex}
    />
    <MiniButton
      tooltip='Удалить выбранные [Delete]'
      icon={<DumpBinIcon color={isMutable && !nothingSelected ? 'text-warning' : ''} size={5}/>}
      disabled={!isMutable || nothingSelected}
      onClick={onDelete}
    />
    <HelpButton topic={HelpTopic.CSTLIST} offset={5} />
  </Overlay>);
}

export default RSListToolbar;