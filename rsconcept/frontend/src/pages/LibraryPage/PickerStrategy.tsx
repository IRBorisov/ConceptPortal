'use client';

import { useCallback } from 'react';
import { BiFilterAlt } from 'react-icons/bi';

import Dropdown from '@/components/ui/Dropdown';
import DropdownCheckbox from '@/components/ui/DropdownCheckbox';
import SelectorButton from '@/components/ui/SelectorButton';
import { useAuth } from '@/context/AuthContext';
import useDropdown from '@/hooks/useDropdown';
import { LibraryFilterStrategy } from '@/models/miscellaneous';
import { prefixes } from '@/utils/constants';
import { describeLibraryFilter, labelLibraryFilter } from '@/utils/labels';

interface PickerStrategyProps {
  value: LibraryFilterStrategy;
  onChange: (value: LibraryFilterStrategy) => void;
}

function PickerStrategy({ value, onChange }: PickerStrategyProps) {
  const strategyMenu = useDropdown();
  const { user } = useAuth();

  const handleChange = useCallback(
    (newValue: LibraryFilterStrategy) => {
      strategyMenu.hide();
      onChange(newValue);
    },
    [strategyMenu, onChange]
  );

  function isStrategyDisabled(strategy: LibraryFilterStrategy): boolean {
    if (
      strategy === LibraryFilterStrategy.PERSONAL ||
      strategy === LibraryFilterStrategy.SUBSCRIBE ||
      strategy === LibraryFilterStrategy.OWNED
    ) {
      return !user;
    } else {
      return false;
    }
  }

  return (
    <div ref={strategyMenu.ref} className='h-full text-right'>
      <SelectorButton
        transparent
        tabIndex={-1}
        title='Список фильтров'
        hideTitle={strategyMenu.isOpen}
        className='h-full'
        icon={<BiFilterAlt size='1.25rem' />}
        text={labelLibraryFilter(value)}
        onClick={strategyMenu.toggle}
      />
      <Dropdown isOpen={strategyMenu.isOpen}>
        {Object.values(LibraryFilterStrategy).map((enumValue, index) => {
          const strategy = enumValue as LibraryFilterStrategy;
          return (
            <DropdownCheckbox
              key={`${prefixes.library_filters_list}${index}`}
              value={value === strategy}
              setValue={() => handleChange(strategy)}
              label={labelLibraryFilter(strategy)}
              title={describeLibraryFilter(strategy)}
              disabled={isStrategyDisabled(strategy)}
            />
          );
        })}
      </Dropdown>
    </div>
  );
}

export default PickerStrategy;
