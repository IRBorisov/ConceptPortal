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
  dense?: boolean;
  onChange: (value: DependencyMode) => void;
}

function SelectGraphFilter({ value, dense, onChange }: SelectGraphFilterProps) {
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
        titleHtml='Настройка фильтрации <br/>по графу термов'
        hideTitle={menu.isOpen}
        className='h-full pr-2'
        icon={<DependencyIcon value={value} size='1rem' />}
        text={dense || size.isSmall ? undefined : labelCstSource(value)}
        onClick={menu.toggle}
      />
      <Dropdown stretchLeft isOpen={menu.isOpen}>
        {Object.values(DependencyMode)
          .filter(value => !isNaN(Number(value)))
          .map((value, index) => {
            const source = value as DependencyMode;
            return (
              <DropdownButton
                className={!dense ? 'w-[18rem]' : undefined}
                key={`${prefixes.cst_source_list}${index}`}
                onClick={() => handleChange(source)}
              >
                <div className='inline-flex items-center gap-1'>
                  {<DependencyIcon value={source} size='1rem' />}
                  {!dense ? (
                    <span>
                      <b>{labelCstSource(source)}:</b> {describeCstSource(source)}
                    </span>
                  ) : null}
                </div>
              </DropdownButton>
            );
          })}
      </Dropdown>
    </div>
  );
}

export default SelectGraphFilter;
