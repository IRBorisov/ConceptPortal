'use client';

import { useMemo } from 'react';
import { BiAnalyse, BiDiamond, BiDownArrowCircle, BiDownvote, BiDuplicate, BiPlusCircle, BiTrash, BiUpvote } from "react-icons/bi";

import Dropdown from '@/components/Common/Dropdown';
import DropdownButton from '@/components/Common/DropdownButton';
import MiniButton from '@/components/Common/MiniButton';
import Overlay from '@/components/Common/Overlay';
import HelpButton from '@/components/Help/HelpButton';
import useDropdown from '@/hooks/useDropdown';
import { HelpTopic } from '@/models/miscelanious';
import { CstType } from '@/models/rsform';
import { prefixes } from '@/utils/constants';
import { labelCstType } from '@/utils/labels';
import { getCstTypePrefix, getCstTypeShortcut } from '@/utils/misc';

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
      icon={<BiUpvote size='1.25rem'/>}
      disabled={!isMutable || nothingSelected}
      onClick={onMoveUp}
    />
    <MiniButton
      tooltip='Переместить вниз [Alt + вниз]'
      icon={<BiDownvote size='1.25rem'/>}
      disabled={!isMutable || nothingSelected}
      onClick={onMoveDown}
    />
    <MiniButton
      tooltip='Клонировать конституенту [Alt + V]'
      icon={<BiDuplicate size='1.25rem' className={isMutable && selectedCount === 1 ? 'clr-text-success': ''} />}
      disabled={!isMutable || selectedCount !== 1}
      onClick={onClone}
    />
    <MiniButton
      tooltip='Добавить новую конституенту... [Alt + `]'
      icon={<BiPlusCircle size='1.25rem' className={isMutable ? 'clr-text-success': ''} />}
      disabled={!isMutable}
      onClick={() => onCreate()}
    />
    <div ref={insertMenu.ref} className='flex justify-center'>
      <div>
        <MiniButton
          tooltip='Добавить пустую конституенту'
          icon={<BiDownArrowCircle size='1.25rem' className={isMutable ? 'clr-text-success': ''} />}
          disabled={!isMutable}
          onClick={insertMenu.toggle}
        />
        {insertMenu.isActive ?
        <Dropdown>
        {(Object.values(CstType)).map(
        (typeStr) => 
          <DropdownButton
            key={`${prefixes.csttype_list}${typeStr}`}
            text={`${getCstTypePrefix(typeStr as CstType)}1 — ${labelCstType(typeStr as CstType)}`}
            onClick={() => onCreate(typeStr as CstType)}
            tooltip={getCstTypeShortcut(typeStr as CstType)}
          />
        )}
        </Dropdown> : null}
      </div>
    </div>
    <MiniButton
      tooltip='Создать конституенту из шаблона [Alt + E]'
      icon={<BiDiamond size='1.25rem' className={isMutable ? 'clr-text-primary': ''} />}
      disabled={!isMutable}
      onClick={onTemplates}
    />
    <MiniButton
      tooltip='Сброс имён: присвоить порядковые имена [Alt + R]'
      icon={<BiAnalyse size='1.25rem' className={isMutable ? 'clr-text-primary': ''} />}
      disabled={!isMutable}
      onClick={onReindex}
    />
    <MiniButton
      tooltip='Удалить выбранные [Delete]'
      icon={<BiTrash size='1.25rem' className={isMutable && !nothingSelected ? 'clr-text-warning' : ''} />}
      disabled={!isMutable || nothingSelected}
      onClick={onDelete}
    />
    <HelpButton topic={HelpTopic.CSTLIST} offset={5} />
  </Overlay>);
}

export default RSListToolbar;