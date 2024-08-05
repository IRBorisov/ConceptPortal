'use client';

import { IconOSS } from '@/components/Icons';
import { CProps } from '@/components/props';
import Dropdown from '@/components/ui/Dropdown';
import DropdownButton from '@/components/ui/DropdownButton';
import Label from '@/components/ui/Label';
import MiniButton from '@/components/ui/MiniButton';
import useDropdown from '@/hooks/useDropdown';
import { ILibraryItemReference } from '@/models/library';
import { prefixes } from '@/utils/constants';

interface MiniSelectorOSSProps {
  items: ILibraryItemReference[];
  onSelect: (event: CProps.EventMouse, newValue: ILibraryItemReference) => void;
}

function MiniSelectorOSS({ items, onSelect }: MiniSelectorOSSProps) {
  const ossMenu = useDropdown();

  function onToggle(event: CProps.EventMouse) {
    if (items.length > 1) {
      ossMenu.toggle();
    } else {
      onSelect(event, items[0]);
    }
  }

  return (
    <div ref={ossMenu.ref} className='flex items-center'>
      <MiniButton
        icon={<IconOSS size='1.25rem' className='icon-primary' />}
        title='Операционные схемы'
        hideTitle={ossMenu.isOpen}
        onClick={onToggle}
      />
      {items.length > 1 ? (
        <Dropdown isOpen={ossMenu.isOpen}>
          <Label text='Список ОСС' className='border-b px-3 py-1' />
          {items.map((reference, index) => (
            <DropdownButton
              className='min-w-[5rem]'
              key={`${prefixes.oss_list}${index}`}
              text={reference.alias}
              onClick={event => onSelect(event, reference)}
            />
          ))}
        </Dropdown>
      ) : null}
    </div>
  );
}

export default MiniSelectorOSS;
