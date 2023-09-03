import { useCallback } from 'react';

import Button from '../../components/Common/Button';
import Dropdown from '../../components/Common/Dropdown';
import DropdownCheckbox from '../../components/Common/DropdownCheckbox';
import { FilterCogIcon } from '../../components/Icons';
import { useAuth } from '../../context/AuthContext';
import useDropdown from '../../hooks/useDropdown';
import { LibraryFilterStrategy } from '../../utils/models';

interface PickerStrategyProps {
  value: LibraryFilterStrategy
  onChange: (value: LibraryFilterStrategy) => void
}

function PickerStrategy({ value, onChange }: PickerStrategyProps) {
  const pickerMenu = useDropdown();
  const { user } = useAuth();

  const handleChange = useCallback(
  (newValue: LibraryFilterStrategy) => {
    pickerMenu.hide();
    onChange(newValue);
  }, [pickerMenu, onChange]);

  return (
  <div ref={pickerMenu.ref} className='h-full text-right'>
    <Button
      icon={<FilterCogIcon size={6} />}
      dense
      tooltip='Фильтры'
      colorClass='clr-input clr-hover text-btn'
      widthClass='h-full py-1 px-2 border-none'
      onClick={pickerMenu.toggle}
    />
    { pickerMenu.isActive &&
    <Dropdown>
      <DropdownCheckbox
        onChange={() => handleChange(LibraryFilterStrategy.MANUAL)}
        value={value === LibraryFilterStrategy.MANUAL}
        label='Отображать все'
      />
      <DropdownCheckbox
        onChange={() => handleChange(LibraryFilterStrategy.COMMON)}
        value={value === LibraryFilterStrategy.COMMON}
        label='Общедоступные'
        tooltip='Отображать только общедоступные схемы'
      />
      <DropdownCheckbox
        onChange={() => handleChange(LibraryFilterStrategy.CANONICAL)}
        value={value === LibraryFilterStrategy.CANONICAL}
        label='Неизменные'
        tooltip='Отображать только стандартные схемы'
      />
      <DropdownCheckbox
        onChange={() => handleChange(LibraryFilterStrategy.PERSONAL)}
        value={value === LibraryFilterStrategy.PERSONAL}
        label='Личные'
        disabled={!user}
        tooltip='Отображать только подписки и владеемые схемы'
      />
      <DropdownCheckbox
        onChange={() => handleChange(LibraryFilterStrategy.SUBSCRIBE)}
        value={value === LibraryFilterStrategy.SUBSCRIBE}
        label='Подписки'
        disabled={!user}
        tooltip='Отображать только подписки'
      />
      <DropdownCheckbox
        onChange={() => handleChange(LibraryFilterStrategy.OWNED)}
        value={value === LibraryFilterStrategy.OWNED}
        disabled={!user}
        label='Я - Владелец!'
        tooltip='Отображать только владеемые схемы'
      />
    </Dropdown>}
  </div>
  );
}

export default PickerStrategy;
