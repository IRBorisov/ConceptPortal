'use client';

import clsx from 'clsx';

import { MiniButton } from '@/components/control1';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown1';
import { IconOSS } from '@/components/icons1';
import { Label } from '@/components/input1';
import { type Styling } from '@/components/props';
import { prefixes } from '@/utils/constants';

import { type ILibraryItemReference } from '../models/library';

interface MiniSelectorOSSProps extends Styling {
  items: ILibraryItemReference[];
  onSelect: (event: React.MouseEvent<HTMLElement>, newValue: ILibraryItemReference) => void;
}

export function MiniSelectorOSS({ items, onSelect, className, ...restProps }: MiniSelectorOSSProps) {
  const ossMenu = useDropdown();

  function onToggle(event: React.MouseEvent<HTMLElement>) {
    if (items.length > 1) {
      ossMenu.toggle();
    } else {
      onSelect(event, items[0]);
    }
  }

  return (
    <div ref={ossMenu.ref} className={clsx('relative flex items-center', className)} {...restProps}>
      <MiniButton
        icon={<IconOSS size='1.25rem' className='icon-primary' />}
        title='Операционные схемы'
        hideTitle={ossMenu.isOpen}
        onClick={onToggle}
      />
      {items.length > 1 ? (
        <Dropdown isOpen={ossMenu.isOpen} margin='mt-1'>
          <Label text='Список ОСС' className='border-b px-3 py-1' />
          {items.map((reference, index) => (
            <DropdownButton
              className='min-w-20'
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
