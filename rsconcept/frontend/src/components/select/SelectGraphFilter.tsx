'use client';

import { useCallback } from 'react';

import Dropdown from '@/components/ui/Dropdown';
import SelectorButton from '@/components/ui/SelectorButton';
import useDropdown from '@/hooks/useDropdown';
import useWindowSize from '@/hooks/useWindowSize';
import { DependencyMode } from '@/models/miscellaneous';
import { prefixes } from '@/utils/constants';
import { describeCstSource, labelCstSource } from '@/utils/labels';

import { DependencyIcon } from '../DomainIcons';
import DropdownButton from '../ui/DropdownButton';

interface SelectGraphFilterProps {
  value: DependencyMode;
  onChange: (value: DependencyMode) => void;
}

function SelectGraphFilter({ value, onChange }: SelectGraphFilterProps) {
  const menu = useDropdown();
  const size = useWindowSize();

  const handleChange = useCallback(
    (newValue: DependencyMode) => {
      menu.hide();
      onChange(newValue);
    },
    [menu, onChange]
  );

  return (
    <div ref={menu.ref}>
      <SelectorButton
        transparent
        tabIndex={-1}
        title='Настройка фильтрации по графу термов'
        hideTitle={menu.isOpen}
        className='h-full pr-2'
        icon={DependencyIcon(value, '1rem', value !== DependencyMode.ALL ? 'icon-primary' : '')}
        text={size.isSmall ? undefined : labelCstSource(value)}
        onClick={menu.toggle}
      />
      <Dropdown stretchLeft isOpen={menu.isOpen}>
        {Object.values(DependencyMode)
          .filter(value => !isNaN(Number(value)))
          .map((value, index) => {
            const source = value as DependencyMode;
            return (
              <DropdownButton
                className='w-[18rem]'
                key={`${prefixes.cst_source_list}${index}`}
                onClick={() => handleChange(source)}
              >
                <div className='inline-flex items-center gap-1'>
                  {DependencyIcon(source, '1rem')}
                  <b>{labelCstSource(source)}:</b> {describeCstSource(source)}
                </div>
              </DropdownButton>
            );
          })}
      </Dropdown>
    </div>
  );
}

export default SelectGraphFilter;
