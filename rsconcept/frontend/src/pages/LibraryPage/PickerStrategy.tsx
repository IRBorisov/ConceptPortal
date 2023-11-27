import { useCallback } from 'react';

import Dropdown from '../../components/common/Dropdown';
import DropdownCheckbox from '../../components/common/DropdownCheckbox';
import SelectorButton from '../../components/common/SelectorButton';
import { FilterIcon } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';
import useDropdown from '../../hooks/useDropdown';
import { LibraryFilterStrategy } from '../../models/miscelanious';
import { prefixes } from '../../utils/constants';
import { describeLibraryFilter, labelLibraryFilter } from '../../utils/labels';

interface PickerStrategyProps {
  value: LibraryFilterStrategy
  onChange: (value: LibraryFilterStrategy) => void
}

function PickerStrategy({ value, onChange }: PickerStrategyProps) {
  const strategyMenu = useDropdown();
  const { user } = useAuth();

  const handleChange = useCallback(
  (newValue: LibraryFilterStrategy) => {
    strategyMenu.hide();
    onChange(newValue);
  }, [strategyMenu, onChange]);

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
    <SelectorButton transparent tabIndex={-1}
      tooltip='Список фильтров'
      dimensions='w-fit h-full'
      icon={<FilterIcon size={5} />}
      text={labelLibraryFilter(value)}
      onClick={strategyMenu.toggle}
    />
    {strategyMenu.isActive ?
    <Dropdown>
      {Object.values(LibraryFilterStrategy).map(
      (enumValue, index) => {
        const strategy = enumValue as LibraryFilterStrategy;
        return (
        <DropdownCheckbox
          key={`${prefixes.library_filters_list}${index}`}
          value={value === strategy}
          setValue={() => handleChange(strategy)}
          label={labelLibraryFilter(strategy)}
          tooltip={describeLibraryFilter(strategy)}
          disabled={isStrategyDisabled(strategy)}
        />);
      })}
    </Dropdown> : null}
  </div>
  );
}

export default PickerStrategy;
