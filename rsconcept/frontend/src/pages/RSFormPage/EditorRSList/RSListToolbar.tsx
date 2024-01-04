'use client';

import { useMemo } from 'react';
import { BiDownArrowCircle, BiDownvote, BiDuplicate, BiPlusCircle, BiTrash, BiUpvote } from 'react-icons/bi';

import HelpButton from '@/components/Help/HelpButton';
import Dropdown from '@/components/ui/Dropdown';
import DropdownButton from '@/components/ui/DropdownButton';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import useDropdown from '@/hooks/useDropdown';
import { HelpTopic } from '@/models/miscellaneous';
import { CstType } from '@/models/rsform';
import { getCstTypePrefix } from '@/models/rsformAPI';
import { prefixes } from '@/utils/constants';
import { getCstTypeShortcut, labelCstType } from '@/utils/labels';

interface RSListToolbarProps {
  isMutable?: boolean;
  selectedCount: number;

  onMoveUp: () => void;
  onMoveDown: () => void;
  onDelete: () => void;
  onClone: () => void;
  onCreate: (type?: CstType) => void;
}

function RSListToolbar({
  selectedCount,
  isMutable,
  onMoveUp,
  onMoveDown,
  onDelete,
  onClone,
  onCreate
}: RSListToolbarProps) {
  const insertMenu = useDropdown();
  const nothingSelected = useMemo(() => selectedCount === 0, [selectedCount]);

  return (
    <Overlay position='top-1 right-1/2 translate-x-1/2' className='flex items-start'>
      <MiniButton
        title='Переместить вверх [Alt + вверх]'
        icon={<BiUpvote size='1.25rem' className={isMutable && !nothingSelected ? 'clr-text-primary' : ''} />}
        disabled={!isMutable || nothingSelected}
        onClick={onMoveUp}
      />
      <MiniButton
        title='Переместить вниз [Alt + вниз]'
        icon={<BiDownvote size='1.25rem' className={isMutable && !nothingSelected ? 'clr-text-primary' : ''} />}
        disabled={!isMutable || nothingSelected}
        onClick={onMoveDown}
      />
      <MiniButton
        title='Клонировать конституенту [Alt + V]'
        icon={<BiDuplicate size='1.25rem' className={isMutable && selectedCount === 1 ? 'clr-text-success' : ''} />}
        disabled={!isMutable || selectedCount !== 1}
        onClick={onClone}
      />
      <MiniButton
        title='Добавить новую конституенту... [Alt + `]'
        icon={<BiPlusCircle size='1.25rem' className={isMutable ? 'clr-text-success' : ''} />}
        disabled={!isMutable}
        onClick={() => onCreate()}
      />
      <div ref={insertMenu.ref}>
        <MiniButton
          title='Добавить пустую конституенту'
          icon={<BiDownArrowCircle size='1.25rem' className={isMutable ? 'clr-text-success' : ''} />}
          disabled={!isMutable}
          onClick={insertMenu.toggle}
        />
        <Dropdown isOpen={insertMenu.isOpen}>
          {Object.values(CstType).map(typeStr => (
            <DropdownButton
              key={`${prefixes.csttype_list}${typeStr}`}
              text={`${getCstTypePrefix(typeStr as CstType)}1 — ${labelCstType(typeStr as CstType)}`}
              onClick={() => onCreate(typeStr as CstType)}
              title={getCstTypeShortcut(typeStr as CstType)}
            />
          ))}
        </Dropdown>
      </div>
      <MiniButton
        title='Удалить выбранные [Delete]'
        icon={<BiTrash size='1.25rem' className={isMutable && !nothingSelected ? 'clr-text-warning' : ''} />}
        disabled={!isMutable || nothingSelected}
        onClick={onDelete}
      />
      <HelpButton topic={HelpTopic.CSTLIST} offset={5} />
    </Overlay>
  );
}

export default RSListToolbar;
