'use client';

import clsx from 'clsx';

import { MiniButton } from '@/components/control';
import { Dropdown, DropdownButton, useDropdown } from '@/components/dropdown';
import { IconOSS } from '@/components/icons';
import { Label } from '@/components/input';
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
    <div
      ref={ossMenu.ref}
      onBlur={ossMenu.handleBlur}
      className={clsx('relative flex items-center', className)}
      {...restProps}
    >
      <MiniButton
        title='Операционные схемы'
        icon={<IconOSS size='1.25rem' className='icon-primary' />}
        hideTitle={ossMenu.isOpen}
        onClick={onToggle}
      />
      {items.length > 1 ? (
        <Dropdown isOpen={ossMenu.isOpen} margin='mt-1'>
          <Label text='Список ОСС' className='border-b px-3 py-1' />
          {items.map((reference, index) => (
            <DropdownButton
              key={`${prefixes.oss_list}${index}`}
              text={reference.alias}
              className='min-w-20'
              onClick={event => onSelect(event, reference)}
            />
          ))}
        </Dropdown>
      ) : null}
    </div>
  );
}
