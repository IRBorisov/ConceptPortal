import { useCallback } from 'react';

import Dropdown from '../../../components/Common/Dropdown';
import DropdownButton from '../../../components/Common/DropdownButton';
import { FilterCogIcon } from '../../../components/Icons';
import useDropdown from '../../../hooks/useDropdown';
import { CstMatchMode } from '../../../models/miscelanious';
import { labelCstMathchMode } from '../../../utils/labels';

interface MatchModePickerProps {
  value: CstMatchMode
  onChange: (value: CstMatchMode) => void
}

function MatchModePicker({ value, onChange }: MatchModePickerProps) {
  const pickerMenu = useDropdown();

  const handleChange = useCallback(
  (newValue: CstMatchMode) => {
    pickerMenu.hide();
    onChange(newValue);
  }, [pickerMenu, onChange]);

  return (
  <div ref={pickerMenu.ref} className='h-full'>
    <button
      className='h-full w-[6rem] px-1 py-1 border clr-input clr-hover clr-btn-default text-btn inline-flex align-middle gap-1'
      title='Настройка атрибутов для фильтрации'
      tabIndex={-1}
      onClick={pickerMenu.toggle}
    >
      <FilterCogIcon color='text-controls' size={5} />
      <span className='text-sm font-semibold whitespace-nowrap'>{labelCstMathchMode(value)}</span>
    </button>
    { pickerMenu.isActive &&
      <Dropdown stretchLeft>
        <DropdownButton onClick={() => handleChange(CstMatchMode.ALL)}>
          <p><b>везде:</b> искать во всех атрибутах</p>
        </DropdownButton>
        <DropdownButton onClick={() => handleChange(CstMatchMode.EXPR)}>
          <p><b>выраж:</b> искать в формальных выражениях</p>
        </DropdownButton>
        <DropdownButton onClick={() => handleChange(CstMatchMode.TERM)}>
          <p><b>термин:</b> искать в терминах</p>
        </DropdownButton>
        <DropdownButton onClick={() => handleChange(CstMatchMode.TEXT)}>
          <p><b>текст:</b> искать в определениях и конвенциях</p>
        </DropdownButton>
        <DropdownButton onClick={() => handleChange(CstMatchMode.NAME)}>
          <p><b>имя:</b> искать в идентификаторах конституент</p>
        </DropdownButton>
      </Dropdown>
    }
  </div>
  );
}

export default MatchModePicker;
