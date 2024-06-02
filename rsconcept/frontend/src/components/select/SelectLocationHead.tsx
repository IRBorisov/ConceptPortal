'use client';

import { useCallback } from 'react';

import Dropdown from '@/components/ui/Dropdown';
import SelectorButton from '@/components/ui/SelectorButton';
import useDropdown from '@/hooks/useDropdown';
import { LocationHead } from '@/models/library';
import { prefixes } from '@/utils/constants';
import { describeLocationHead, labelLocationHead } from '@/utils/labels';

import { LocationHeadIcon } from '../DomainIcons';
import DropdownButton from '../ui/DropdownButton';

interface SelectLocationHeadProps {
  value: LocationHead;
  onChange: (value: LocationHead) => void;
  excluded?: LocationHead[];
}

function SelectLocationHead({ value, excluded = [], onChange }: SelectLocationHeadProps) {
  const menu = useDropdown();

  const handleChange = useCallback(
    (newValue: LocationHead) => {
      menu.hide();
      onChange(newValue);
    },
    [menu, onChange]
  );

  return (
    <div ref={menu.ref} className='h-full text-right'>
      <SelectorButton
        transparent
        tabIndex={-1}
        title={describeLocationHead(value)}
        hideTitle={menu.isOpen}
        className='h-full'
        icon={<LocationHeadIcon value={value} size='1rem' />}
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
                  <LocationHeadIcon value={head} size='1rem' />
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
