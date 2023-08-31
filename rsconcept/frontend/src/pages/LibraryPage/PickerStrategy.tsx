import { useCallback } from 'react';

import Button from '../../components/Common/Button';
import Checkbox from '../../components/Common/Checkbox';
import Dropdown from '../../components/Common/Dropdown';
import DropdownButton from '../../components/Common/DropdownButton';
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
      <DropdownButton onClick={() => handleChange(LibraryFilterStrategy.MANUAL)}>
        <Checkbox 
          value={value === LibraryFilterStrategy.MANUAL}
          label='Отображать все'
          widthClass='w-fit px-2'
        />
      </DropdownButton>
      <DropdownButton onClick={() => handleChange(LibraryFilterStrategy.COMMON)}>
        <Checkbox 
          value={value === LibraryFilterStrategy.COMMON}
          label='Общедоступные'
          widthClass='w-fit px-2'
          tooltip='Отображать только общедоступные схемы'
        />
      </DropdownButton>
      <DropdownButton onClick={() => handleChange(LibraryFilterStrategy.CANONICAL)}>
        <Checkbox 
          value={value === LibraryFilterStrategy.CANONICAL}
          label='Неизменные'
          widthClass='w-fit px-2'
          tooltip='Отображать только неизменные схемы'
        />
      </DropdownButton>
      <DropdownButton onClick={() => handleChange(LibraryFilterStrategy.PERSONAL)}>
        <Checkbox 
          value={value === LibraryFilterStrategy.PERSONAL}
          label='Личные'
          disabled={!user}
          widthClass='w-fit px-2'
          tooltip='Отображать только подписки и владеемые схемы'
        />
      </DropdownButton>
      <DropdownButton onClick={() => handleChange(LibraryFilterStrategy.SUBSCRIBE)}>
        <Checkbox 
          value={value === LibraryFilterStrategy.SUBSCRIBE}
          label='Подписки'
          disabled={!user}
          widthClass='w-fit px-2'
          tooltip='Отображать только подписки'
        />
      </DropdownButton>
      <DropdownButton onClick={() => handleChange(LibraryFilterStrategy.OWNED)}>
        <Checkbox 
          value={value === LibraryFilterStrategy.OWNED}
          disabled={!user}
          label='Я - Владелец!'
          widthClass='w-fit px-2'
          tooltip='Отображать только владеемые схемы'
        />
      </DropdownButton>
    </Dropdown>}
  </div>
  );
}

export default PickerStrategy;
