'use client';

import clsx from 'clsx';

import { MiniButton } from '@/components/Control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/Dropdown';
import { IconOSS } from '@/components/Icons';
import { Label } from '@/components/Input';
import { CProps } from '@/components/props';
import { ILibraryItemReference } from '@/features/library/models/library';
import { prefixes } from '@/utils/constants';

interface MiniSelectorOSSProps extends CProps.Styling {
  items: ILibraryItemReference[];
  onSelect: (event: CProps.EventMouse, newValue: ILibraryItemReference) => void;
}

function MiniSelectorOSS({ items, onSelect, className, ...restProps }: MiniSelectorOSSProps) {
  const ossMenu = useDropdown();

  function onToggle(event: CProps.EventMouse) {
    if (items.length > 1) {
      ossMenu.toggle();
    } else {
      onSelect(event, items[0]);
    }
  }

  return (
    <div ref={ossMenu.ref} className={clsx('flex items-center', className)} {...restProps}>
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
