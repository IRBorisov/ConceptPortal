'use client';

import { useMemo } from 'react';
import { BiDownArrowCircle, BiDownvote, BiDuplicate, BiPlusCircle, BiTrash, BiUpvote } from 'react-icons/bi';

import HelpButton from '@/components/man/HelpButton';
import Dropdown from '@/components/ui/Dropdown';
import DropdownButton from '@/components/ui/DropdownButton';
import MiniButton from '@/components/ui/MiniButton';
import Overlay from '@/components/ui/Overlay';
import useDropdown from '@/hooks/useDropdown';
import { HelpTopic } from '@/models/miscellaneous';
import { CstType } from '@/models/rsform';
import { getCstTypePrefix } from '@/models/rsformAPI';
import { prefixes } from '@/utils/constants';
import { getCstTypeShortcut, labelCstType, prepareTooltip } from '@/utils/labels';

import { useRSEdit } from '../RSEditContext';

interface RSListToolbarProps {
  selectedCount: number;
}

function RSListToolbar({ selectedCount }: RSListToolbarProps) {
  const controller = useRSEdit();
  const insertMenu = useDropdown();
  const nothingSelected = useMemo(() => selectedCount === 0, [selectedCount]);

  return (
    <Overlay position='top-1 right-1/2 translate-x-1/2' className='flex items-start'>
      <MiniButton
        titleHtml={prepareTooltip('Переместить вверх', 'Alt + вверх')}
        icon={<BiUpvote size='1.25rem' className='icon-primary' />}
        disabled={controller.isProcessing || nothingSelected}
        onClick={controller.moveUp}
      />
      <MiniButton
        titleHtml={prepareTooltip('Переместить вниз', 'Alt + вниз')}
        icon={<BiDownvote size='1.25rem' className='icon-primary' />}
        disabled={controller.isProcessing || nothingSelected}
        onClick={controller.moveDown}
      />
      <MiniButton
        titleHtml={prepareTooltip('Клонировать конституенту', 'Alt + V')}
        icon={<BiDuplicate size='1.25rem' className='icon-green' />}
        disabled={controller.isProcessing || selectedCount !== 1}
        onClick={controller.cloneCst}
      />
      <MiniButton
        titleHtml={prepareTooltip('Добавить новую конституенту...', 'Alt + `')}
        icon={<BiPlusCircle size='1.25rem' className='icon-green' />}
        disabled={controller.isProcessing}
        onClick={() => controller.createCst(undefined, false)}
      />
      <div ref={insertMenu.ref}>
        <MiniButton
          title='Добавить пустую конституенту'
          hideTitle={insertMenu.isOpen}
          icon={<BiDownArrowCircle size='1.25rem' className='icon-green' />}
          disabled={controller.isProcessing}
          onClick={insertMenu.toggle}
        />
        <Dropdown isOpen={insertMenu.isOpen}>
          {Object.values(CstType).map(typeStr => (
            <DropdownButton
              key={`${prefixes.csttype_list}${typeStr}`}
              text={`${getCstTypePrefix(typeStr as CstType)}1 — ${labelCstType(typeStr as CstType)}`}
              onClick={() => controller.createCst(typeStr as CstType, true)}
              titleHtml={getCstTypeShortcut(typeStr as CstType)}
            />
          ))}
        </Dropdown>
      </div>
      <MiniButton
        titleHtml={prepareTooltip('Удалить выбранные', 'Delete')}
        icon={<BiTrash size='1.25rem' className='icon-red' />}
        disabled={controller.isProcessing || nothingSelected}
        onClick={controller.deleteCst}
      />
      <HelpButton topic={HelpTopic.CSTLIST} offset={5} />
    </Overlay>
  );
}

export default RSListToolbar;
