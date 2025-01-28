'use client';

import clsx from 'clsx';
import { useCallback } from 'react';

import { LocationIcon } from '@/components/DomainIcons';
import { CProps } from '@/components/props';
import Dropdown from '@/components/ui/Dropdown';
import DropdownButton from '@/components/ui/DropdownButton';
import SelectorButton from '@/components/ui/SelectorButton';
import useDropdown from '@/hooks/useDropdown';
import { LocationHead } from '@/models/library';
import { prefixes } from '@/utils/constants';
import { describeLocationHead, labelLocationHead } from '@/utils/labels';

interface SelectLocationHeadProps extends CProps.Styling {
  value: LocationHead;
  onChange: (newValue: LocationHead) => void;
  excluded?: LocationHead[];
}

function SelectLocationHead({ value, excluded = [], onChange, className, ...restProps }: SelectLocationHeadProps) {
  const menu = useDropdown();

  const handleChange = useCallback(
    (newValue: LocationHead) => {
      menu.hide();
      onChange(newValue);
    },
    [menu, onChange]
  );

  return (
    <div ref={menu.ref} className={clsx('h-full text-right', className)} {...restProps}>
      <SelectorButton
        transparent
        tabIndex={-1}
        title={describeLocationHead(value)}
        hideTitle={menu.isOpen}
        className='h-full'
        icon={<LocationIcon value={value} size='1rem' />}
        text={labelLocationHead(value)}
        onClick={menu.toggle}
      />

      <Dropdown isOpen={menu.isOpen} className='z-modalTooltip'>
        {Object.values(LocationHead)
          .filter(head => !excluded.includes(head))
          .map((head, index) => {
            return (
              <DropdownButton
                className='w-[10rem]'
                key={`${prefixes.location_head_list}${index}`}
                onClick={() => handleChange(head)}
                title={describeLocationHead(head)}
              >
                <div className='inline-flex items-center gap-3'>
                  <LocationIcon value={head} size='1rem' />
                  {labelLocationHead(head)}
                </div>
              </DropdownButton>
            );
          })}
      </Dropdown>
    </div>
  );
}

export default SelectLocationHead;
